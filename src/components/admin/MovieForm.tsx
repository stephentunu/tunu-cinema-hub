import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { FileDropZone } from "./FileDropZone";
import { VideoInput } from "./VideoInput";
import { UploadProgressBar } from "./UploadProgressBar";
import { supabase } from "@/integrations/supabase/client";
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

interface UploadState {
  fileName: string;
  percent: number;
  speed?: string;
  remainingTime?: string;
  uploadedBytes?: number;
  totalBytes?: number;
}

export const MovieForm = ({ movie, onSuccess, onCancel }: MovieFormProps) => {
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState(movie?.video_url || "");
  const [trailerUrl, setTrailerUrl] = useState(movie?.trailer_url || "");
  const [currentUpload, setCurrentUpload] = useState<UploadState | null>(null);
  const queryClient = useQueryClient();
  const { uploadFile, cancelUpload } = useChunkedUpload();

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
      let videoUrlFinal = videoUrl || movie?.video_url;
      let trailerUrlFinal = trailerUrl || movie?.trailer_url;

      // Upload files with progress tracking
      if (posterFile) {
        setCurrentUpload({ fileName: posterFile.name, percent: 0 });
        posterUrl = await uploadFile(posterFile, "posters", (progress) => {
          setCurrentUpload({
            fileName: posterFile.name,
            ...progress,
          });
        });
      }
      if (backdropFile) {
        setCurrentUpload({ fileName: backdropFile.name, percent: 0 });
        backdropUrl = await uploadFile(backdropFile, "backdrops", (progress) => {
          setCurrentUpload({
            fileName: backdropFile.name,
            ...progress,
          });
        });
      }
      if (trailerFile) {
        setCurrentUpload({ fileName: trailerFile.name, percent: 0 });
        trailerUrlFinal = await uploadFile(trailerFile, "trailers", (progress) => {
          setCurrentUpload({
            fileName: trailerFile.name,
            ...progress,
          });
        });
      }
      if (videoFile) {
        setCurrentUpload({ fileName: videoFile.name, percent: 0 });
        videoUrlFinal = await uploadFile(videoFile, "videos", (progress) => {
          setCurrentUpload({
            fileName: videoFile.name,
            ...progress,
          });
        });
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
        video_url: videoUrlFinal || null,
        trailer_url: trailerUrlFinal || null,
      };

      setCurrentUpload({ fileName: "Saving movie...", percent: 100 });

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
      setCurrentUpload(null);
    }
  };

  const handleCancelUpload = () => {
    cancelUpload();
    setCurrentUpload(null);
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

          {/* File uploads with drag and drop */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Media Files (drag & drop or click to browse)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileDropZone
                id="movie-poster"
                label="Poster Image"
                type="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                file={posterFile}
                onFileSelect={setPosterFile}
                existingUrl={movie?.poster_url}
              />

              <FileDropZone
                id="movie-backdrop"
                label="Backdrop Image"
                type="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                file={backdropFile}
                onFileSelect={setBackdropFile}
                existingUrl={movie?.backdrop_url}
              />

              <VideoInput
                id="movie-trailer"
                label="Trailer Video"
                file={trailerFile}
                onFileSelect={setTrailerFile}
                url={trailerUrl}
                onUrlChange={setTrailerUrl}
                existingUrl={movie?.trailer_url}
              />

              <VideoInput
                id="movie-video"
                label="Full Movie Video"
                file={videoFile}
                onFileSelect={setVideoFile}
                url={videoUrl}
                onUrlChange={setVideoUrl}
                existingUrl={movie?.video_url}
              />
            </div>
          </div>

          {currentUpload && (
            <UploadProgressBar
              fileName={currentUpload.fileName}
              percent={currentUpload.percent}
              speed={currentUpload.speed}
              remainingTime={currentUpload.remainingTime}
              uploadedBytes={currentUpload.uploadedBytes}
              totalBytes={currentUpload.totalBytes}
              onCancel={handleCancelUpload}
            />
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
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
