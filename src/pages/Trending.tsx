import { Layout } from "@/components/layout/Layout";
import { MovieSection } from "@/components/movies/MovieSection";
import { useTrendingMovies } from "@/hooks/useMovies";
import { useSeries } from "@/hooks/useSeries";
import { Loader2 } from "lucide-react";

const Trending = () => {
  const { data: movies, isLoading: moviesLoading } = useTrendingMovies();
  const { data: series, isLoading: seriesLoading } = useSeries();

  const isLoading = moviesLoading || seriesLoading;

  const formatMoviesForSection = (movies: any[]) =>
    movies?.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.release_year?.toString() || "N/A",
      rating: m.rating || 0,
      poster: m.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
      genre: m.language || "English",
      slug: m.slug,
    })) || [];

  const formatSeriesForSection = (series: any[]) =>
    series?.map((s) => ({
      id: s.id,
      title: s.title,
      year: s.release_year?.toString() || "N/A",
      rating: s.rating || 0,
      poster: s.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
      genre: `${s.total_seasons || 1} Season${(s.total_seasons || 1) > 1 ? "s" : ""}`,
      slug: s.slug,
      isSeries: true,
    })) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 gradient-text">
          🔥 Trending Now
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <MovieSection
              title="Trending Movies"
              movies={formatMoviesForSection(movies || [])}
            />
            <MovieSection
              title="Trending Series"
              movies={formatSeriesForSection(series || [])}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Trending;
