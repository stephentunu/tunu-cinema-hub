import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie } from "@/hooks/useMovies";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  tagline: z.string().max(255).optional(),
  description: z.string().optional(),
  release_year: z.coerce.number().min(1900).max(2100).optional(),
  duration_minutes: z.coerce.number().min(1).optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  director: z.string().optional(),
  cast_members: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean().optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  movie?: Movie | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MovieForm = ({ movie, onSuccess, onCancel }: MovieFormProps) => {
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [currentUploadFile, setCurrentUploadFile] = useState<string>("");
  const queryClient = useQueryClient();

  const form = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: movie?.title || "",
      tagline: movie?.tagline || "",
      description: movie?.description || "",
      release_year: movie?.release_year || new Date().getFullYear(),
      duration_minutes: movie?.duration_minutes || 0,
      language: movie?.language || "English",
      country: movie?.country || "",
      director: movie?.director || "",
      cast_members: movie?.cast_members?.join(", ") || "",
      status: (movie?.status as "draft" | "published" | "archived") || "draft",
      is_featured: movie?.is_featured || false,
    },
  });

  const uploadFileWithProgress = async (
    file: File,
    folder: string,
    onProgress: (percent: number) => void
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/storage/v1/object/media/${fileName}`;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data } = supabase.storage.from("media").getPublicUrl(fileName);
          resolve(data.publicUrl);
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.send(file);
    });
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: MovieFormData) => {
    setLoading(true);
    try {
      let posterUrl = movie?.poster_url;
      let backdropUrl = movie?.backdrop_url;
      let videoUrl = movie?.video_url;
      let trailerUrl = movie?.trailer_url;

      // Upload files with progress tracking
      if (posterFile) {
        setCurrentUploadFile("poster");
        setUploadProgress("Uploading poster...");
        setUploadPercent(0);
        posterUrl = await uploadFileWithProgress(posterFile, "posters", setUploadPercent);
      }
      if (backdropFile) {
        setCurrentUploadFile("backdrop");
        setUploadProgress("Uploading backdrop...");
        setUploadPercent(0);
        backdropUrl = await uploadFileWithProgress(backdropFile, "backdrops", setUploadPercent);
      }
      if (trailerFile) {
        setCurrentUploadFile("trailer");
        setUploadProgress("Uploading trailer...");
        setUploadPercent(0);
        trailerUrl = await uploadFileWithProgress(trailerFile, "trailers", setUploadPercent);
      }
      if (videoFile) {
        setCurrentUploadFile("video");
        setUploadProgress("Uploading video...");
        setUploadPercent(0);
        videoUrl = await uploadFileWithProgress(videoFile, "videos", setUploadPercent);
      }

      const slug = movie?.slug || generateSlug(data.title);
      const castMembers = data.cast_members
        ? data.cast_members.split(",").map((s) => s.trim()).filter(Boolean)
        : null;

      const movieData = {
        title: data.title,
        slug,
        tagline: data.tagline || null,
        description: data.description || null,
        release_year: data.release_year || null,
        duration_minutes: data.duration_minutes || null,
        language: data.language || null,
        country: data.country || null,
        director: data.director || null,
        cast_members: castMembers,
        status: data.status,
        is_featured: data.is_featured || false,
        poster_url: posterUrl || null,
        backdrop_url: backdropUrl || null,
        video_url: videoUrl || null,
        trailer_url: trailerUrl || null,
      };

      setUploadProgress("Saving movie...");

      if (movie) {
        const { error } = await supabase
          .from("movies")
          .update(movieData)
          .eq("id", movie.id);

        if (error) throw error;
        toast.success("Movie updated successfully!");
      } else {
        const { error } = await supabase.from("movies").insert(movieData);

        if (error) throw error;
        toast.success("Movie created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save movie");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl font-semibold">
          {movie ? "Edit Movie" : "Add New Movie"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Movie title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input placeholder="Short tagline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Movie description..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="release_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="director"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Director</FormLabel>
                  <FormControl>
                    <Input placeholder="Director name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cast_members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cast Members (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Actor 1, Actor 2, Actor 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* File uploads */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Media Files
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Poster Image</label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('poster-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {posterFile ? posterFile.name : 'Choose poster image...'}
                  </Button>
                  <input
                    id="poster-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {movie?.poster_url && !posterFile && (
                    <span className="text-xs text-muted-foreground">Current: {movie.poster_url.split('/').pop()}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Backdrop Image</label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('backdrop-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {backdropFile ? backdropFile.name : 'Choose backdrop image...'}
                  </Button>
                  <input
                    id="backdrop-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setBackdropFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {movie?.backdrop_url && !backdropFile && (
                    <span className="text-xs text-muted-foreground">Current: {movie.backdrop_url.split('/').pop()}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trailer Video</label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('trailer-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {trailerFile ? trailerFile.name : 'Choose trailer video...'}
                  </Button>
                  <input
                    id="trailer-input"
                    type="file"
                    accept=".mp4,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v,.mpeg,.mpg,.3gp,.ts,video/*"
                    onChange={(e) => setTrailerFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {movie?.trailer_url && !trailerFile && (
                    <span className="text-xs text-muted-foreground">Current: {movie.trailer_url.split('/').pop()}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Movie Video</label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('video-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {videoFile ? videoFile.name : 'Choose movie video...'}
                  </Button>
                  <input
                    id="video-input"
                    type="file"
                    accept=".mp4,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v,.mpeg,.mpg,.3gp,.ts,video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {movie?.video_url && !videoFile && (
                    <span className="text-xs text-muted-foreground">Current: {movie.video_url.split('/').pop()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {uploadProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}
                </div>
                <span className="font-medium text-primary">{uploadPercent}%</span>
              </div>
              <Progress value={uploadPercent} className="h-2" />
              {currentUploadFile && (
                <p className="text-xs text-muted-foreground">
                  Uploading: {currentUploadFile === "video" ? videoFile?.name : 
                             currentUploadFile === "trailer" ? trailerFile?.name :
                             currentUploadFile === "poster" ? posterFile?.name :
                             backdropFile?.name}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {movie ? "Update Movie" : "Create Movie"}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
