import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Series } from "@/hooks/useSeries";

const seriesSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  tagline: z.string().max(255).optional(),
  description: z.string().optional(),
  release_year: z.coerce.number().min(1900).max(2100).optional(),
  total_seasons: z.coerce.number().min(1).optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  creator: z.string().optional(),
  cast_members: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean().optional(),
});

type SeriesFormData = z.infer<typeof seriesSchema>;

interface EpisodeInput {
  season_number: number;
  episode_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  videoFile: File | null;
}

interface SeriesFormProps {
  series?: Series | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SeriesForm = ({ series, onSuccess, onCancel }: SeriesFormProps) => {
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [episodes, setEpisodes] = useState<EpisodeInput[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: series?.title || "",
      tagline: series?.tagline || "",
      description: series?.description || "",
      release_year: series?.release_year || new Date().getFullYear(),
      total_seasons: series?.total_seasons || 1,
      language: series?.language || "English",
      country: series?.country || "",
      creator: series?.creator || "",
      cast_members: series?.cast_members?.join(", ") || "",
      status: (series?.status as "draft" | "published" | "archived") || "draft",
      is_featured: series?.is_featured || false,
    },
  });

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const addEpisode = () => {
    const lastEpisode = episodes[episodes.length - 1];
    setEpisodes([
      ...episodes,
      {
        season_number: lastEpisode?.season_number || 1,
        episode_number: (lastEpisode?.episode_number || 0) + 1,
        title: "",
        description: "",
        duration_minutes: 45,
        videoFile: null,
      },
    ]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes(episodes.filter((_, i) => i !== index));
  };

  const updateEpisode = (index: number, field: keyof EpisodeInput, value: any) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [field]: value };
    setEpisodes(updated);
  };

  const onSubmit = async (data: SeriesFormData) => {
    setLoading(true);
    try {
      let posterUrl = series?.poster_url;
      let backdropUrl = series?.backdrop_url;
      let trailerUrl = series?.trailer_url;

      // Upload files
      if (posterFile) {
        setUploadProgress("Uploading poster...");
        posterUrl = await uploadFile(posterFile, "posters");
      }
      if (backdropFile) {
        setUploadProgress("Uploading backdrop...");
        backdropUrl = await uploadFile(backdropFile, "backdrops");
      }
      if (trailerFile) {
        setUploadProgress("Uploading trailer...");
        trailerUrl = await uploadFile(trailerFile, "trailers");
      }

      const slug = series?.slug || generateSlug(data.title);
      const castMembers = data.cast_members
        ? data.cast_members.split(",").map((s) => s.trim()).filter(Boolean)
        : null;

      const seriesData = {
        title: data.title,
        slug,
        tagline: data.tagline || null,
        description: data.description || null,
        release_year: data.release_year || null,
        total_seasons: data.total_seasons || 1,
        language: data.language || null,
        country: data.country || null,
        creator: data.creator || null,
        cast_members: castMembers,
        status: data.status,
        is_featured: data.is_featured || false,
        poster_url: posterUrl || null,
        backdrop_url: backdropUrl || null,
        trailer_url: trailerUrl || null,
      };

      setUploadProgress("Saving series...");

      let seriesId = series?.id;

      if (series) {
        const { error } = await supabase
          .from("series")
          .update(seriesData)
          .eq("id", series.id);

        if (error) throw error;
      } else {
        const { data: newSeries, error } = await supabase
          .from("series")
          .insert(seriesData)
          .select("id")
          .single();

        if (error) throw error;
        seriesId = newSeries.id;
      }

      // Upload episodes
      if (episodes.length > 0 && seriesId) {
        for (let i = 0; i < episodes.length; i++) {
          const episode = episodes[i];
          setUploadProgress(`Uploading episode ${i + 1} of ${episodes.length}...`);

          let videoUrl = null;
          if (episode.videoFile) {
            videoUrl = await uploadFile(episode.videoFile, "episodes");
          }

          const { error } = await supabase.from("episodes").insert({
            series_id: seriesId,
            season_number: episode.season_number,
            episode_number: episode.episode_number,
            title: episode.title,
            description: episode.description || null,
            duration_minutes: episode.duration_minutes || null,
            video_url: videoUrl,
          });

          if (error) throw error;
        }
      }

      toast.success(series ? "Series updated successfully!" : "Series created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save series");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-white/10 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl font-semibold">
          {series ? "Edit Series" : "Add New Series"}
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
                    <Input placeholder="Series title" {...field} />
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
                    placeholder="Series description..."
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
              name="total_seasons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Seasons</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
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
              name="creator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator</FormLabel>
                  <FormControl>
                    <Input placeholder="Creator name" {...field} />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Poster Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  className="file:mr-2 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary file:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Backdrop Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackdropFile(e.target.files?.[0] || null)}
                  className="file:mr-2 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary file:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trailer Video</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setTrailerFile(e.target.files?.[0] || null)}
                  className="file:mr-2 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary file:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Episodes section */}
          {!series && (
            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Episodes</h4>
                <Button type="button" variant="outline" size="sm" onClick={addEpisode}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Episode
                </Button>
              </div>

              {episodes.map((episode, index) => (
                <div
                  key={index}
                  className="bg-muted/30 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Episode {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEpisode(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Season</label>
                      <Input
                        type="number"
                        min={1}
                        value={episode.season_number}
                        onChange={(e) =>
                          updateEpisode(index, "season_number", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Episode #</label>
                      <Input
                        type="number"
                        min={1}
                        value={episode.episode_number}
                        onChange={(e) =>
                          updateEpisode(index, "episode_number", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground">Title</label>
                      <Input
                        value={episode.title}
                        onChange={(e) => updateEpisode(index, "title", e.target.value)}
                        placeholder="Episode title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Duration (min)</label>
                      <Input
                        type="number"
                        value={episode.duration_minutes}
                        onChange={(e) =>
                          updateEpisode(index, "duration_minutes", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Video File</label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          updateEpisode(index, "videoFile", e.target.files?.[0] || null)
                        }
                        className="file:mr-2 file:px-2 file:py-0.5 file:rounded file:border-0 file:bg-primary/20 file:text-primary file:text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress}
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
                  {series ? "Update Series" : "Create Series"}
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
