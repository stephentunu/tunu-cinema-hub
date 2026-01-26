import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  video_url: string | null;
  release_year: number | null;
  duration_minutes: number | null;
  rating: number | null;
  rating_count: number | null;
  language: string | null;
  country: string | null;
  director: string | null;
  cast_members: string[] | null;
  status: string | null;
  is_featured: boolean | null;
  view_count: number | null;
  download_count: number | null;
}

export const useMovies = () => {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useFeaturedMovies = () => {
  return useQuery({
    queryKey: ["featured-movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .limit(5);

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useTrendingMovies = () => {
  return useQuery({
    queryKey: ["trending-movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useNewReleases = () => {
  return useQuery({
    queryKey: ["new-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .order("release_year", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useTopRatedMovies = () => {
  return useQuery({
    queryKey: ["top-rated-movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .order("rating", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useMovie = (slug: string) => {
  return useQuery({
    queryKey: ["movie", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Movie | null;
    },
    enabled: !!slug,
  });
};

export const useSearchMovies = (query: string) => {
  return useQuery({
    queryKey: ["search-movies", query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .ilike("title", `%${query}%`)
        .limit(20);

      if (error) throw error;
      return data as Movie[];
    },
    enabled: query.length > 0,
  });
};
