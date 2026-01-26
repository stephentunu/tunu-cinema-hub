import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Series {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  release_year: number | null;
  total_seasons: number | null;
  rating: number | null;
  rating_count: number | null;
  language: string | null;
  country: string | null;
  creator: string | null;
  cast_members: string[] | null;
  status: string | null;
  is_featured: boolean | null;
  view_count: number | null;
}

export interface Episode {
  id: string;
  series_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  air_date: string | null;
}

export const useSeries = () => {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Series[];
    },
  });
};

export const useFeaturedSeries = () => {
  return useQuery({
    queryKey: ["featured-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .limit(5);

      if (error) throw error;
      return data as Series[];
    },
  });
};

export const useSeriesDetails = (slug: string) => {
  return useQuery({
    queryKey: ["series", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Series | null;
    },
    enabled: !!slug,
  });
};

export const useEpisodes = (seriesId: string) => {
  return useQuery({
    queryKey: ["episodes", seriesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", seriesId)
        .order("season_number", { ascending: true })
        .order("episode_number", { ascending: true });

      if (error) throw error;
      return data as Episode[];
    },
    enabled: !!seriesId,
  });
};
