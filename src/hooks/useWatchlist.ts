import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useWatchlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("watchlist")
        .select(`
          *,
          movies(*),
          series(*)
        `)
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAddToWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movieId, seriesId }: { movieId?: string; seriesId?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        movie_id: movieId || null,
        series_id: seriesId || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (watchlistId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", watchlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

export const useIsInWatchlist = (movieId?: string, seriesId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["watchlist-check", user?.id, movieId, seriesId],
    queryFn: async () => {
      if (!user) return false;

      let query = supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id);

      if (movieId) {
        query = query.eq("movie_id", movieId);
      } else if (seriesId) {
        query = query.eq("series_id", seriesId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && (!!movieId || !!seriesId),
  });
};
