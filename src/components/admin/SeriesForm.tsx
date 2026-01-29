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
import { useChunkedUpload } from "@/hooks/useChunkedUpload";
import { FileDropZone } from "./FileDropZone";
import { UploadProgressBar } from "./UploadProgressBar";
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

interface UploadState {
  fileName: string;
  percent: number;
  speed?: string;
  remainingTime?: string;
  uploadedBytes?: number;
  totalBytes?: number;
}

export const SeriesForm = ({ series, onSuccess, onCancel }: SeriesFormProps) => {
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [currentUpload, setCurrentUpload] = useState<UploadState | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeInput[]>([]);
  const queryClient = useQueryClient();
  const { uploadFile, cancelUpload } = useChunkedUpload();

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

      // Upload files with progress tracking
      if (posterFile) {
        setCurrentUpload({ fileName: posterFile.name, percent: 0 });
        posterUrl = await uploadFile(posterFile, "posters", (progress) => {
          setCurrentUpload({ fileName: posterFile.name, ...progress });
        });
      }
      if (backdropFile) {
        setCurrentUpload({ fileName: backdropFile.name, percent: 0 });
        backdropUrl = await uploadFile(backdropFile, "backdrops", (progress) => {
          setCurrentUpload({ fileName: backdropFile.name, ...progress });
        });
      }
      if (trailerFile) {
        setCurrentUpload({ fileName: trailerFile.name, percent: 0 });
        trailerUrl = await uploadFile(trailerFile, "trailers", (progress) => {
          setCurrentUpload({ fileName: trailerFile.name, ...progress });
        });
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

      setCurrentUpload({ fileName: "Saving series...", percent: 100 });

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
          
          let videoUrl = null;
          if (episode.videoFile) {
            setCurrentUpload({ fileName: episode.videoFile.name, percent: 0 });
            videoUrl = await uploadFile(episode.videoFile, "episodes", (progress) => {
              setCurrentUpload({
                fileName: `Episode ${i + 1}: ${episode.videoFile!.name}`,
                ...progress,
              });
            });
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
      setCurrentUpload(null);
    }
  };

  const handleCancelUpload = () => {
    cancelUpload();
    setCurrentUpload(null);
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

          {/* File uploads with drag and drop */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Media Files (drag & drop or click to browse)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FileDropZone
                id="series-poster"
                label="Poster Image"
                type="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                file={posterFile}
                onFileSelect={setPosterFile}
                existingUrl={series?.poster_url}
              />

              <FileDropZone
                id="series-backdrop"
                label="Backdrop Image"
                type="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                file={backdropFile}
                onFileSelect={setBackdropFile}
                existingUrl={series?.backdrop_url}
              />

              <FileDropZone
                id="series-trailer"
                label="Trailer Video"
                type="video"
                accept=".mp4,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v,.mpeg,.mpg,.3gp,.ts,video/*"
                file={trailerFile}
                onFileSelect={setTrailerFile}
                existingUrl={series?.trailer_url}
              />
            </div>
          </div>

          {/* Episodes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">
                Episodes
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={addEpisode}>
                <Plus className="w-4 h-4 mr-2" />
                Add Episode
              </Button>
            </div>

            {episodes.map((episode, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-white/10 bg-muted/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    placeholder="Season #"
                    value={episode.season_number}
                    onChange={(e) =>
                      updateEpisode(index, "season_number", parseInt(e.target.value) || 1)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Episode #"
                    value={episode.episode_number}
                    onChange={(e) =>
                      updateEpisode(index, "episode_number", parseInt(e.target.value) || 1)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Duration (min)"
                    value={episode.duration_minutes}
                    onChange={(e) =>
                      updateEpisode(index, "duration_minutes", parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <Input
                  placeholder="Episode title"
                  value={episode.title}
                  onChange={(e) => updateEpisode(index, "title", e.target.value)}
                />

                <Textarea
                  placeholder="Episode description..."
                  rows={2}
                  value={episode.description}
                  onChange={(e) => updateEpisode(index, "description", e.target.value)}
                />

                <FileDropZone
                  id={`episode-video-${index}`}
                  label="Episode Video"
                  type="video"
                  accept=".mp4,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v,.mpeg,.mpg,.3gp,.ts,video/*"
                  file={episode.videoFile}
                  onFileSelect={(file) => updateEpisode(index, "videoFile", file)}
                />
              </div>
            ))}
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
