import { Layout } from "@/components/layout/Layout";
import { HeroCarousel } from "@/components/movies/HeroCarousel";
import { ContinueWatching } from "@/components/movies/ContinueWatching";
import { MovieSection } from "@/components/movies/MovieSection";
import { useTrendingMovies, useNewReleases, useTopRatedMovies } from "@/hooks/useMovies";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: trending, isLoading: trendingLoading } = useTrendingMovies();
  const { data: newReleases, isLoading: newReleasesLoading } = useNewReleases();
  const { data: topRated, isLoading: topRatedLoading } = useTopRatedMovies();

  const formatMovies = (movies: any[]) =>
    movies?.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.release_year?.toString() || "N/A",
      rating: m.rating || 0,
      poster: m.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
      genre: m.language || "English",
      slug: m.slug,
    })) || [];

  const isLoading = trendingLoading || newReleasesLoading || topRatedLoading;

  return (
    <Layout>
      <HeroCarousel />
      
      <div className="container mx-auto px-6 space-y-4">
        <ContinueWatching />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <MovieSection title="🔥 Trending Now" movies={formatMovies(trending || [])} />
            <MovieSection title="✨ Recommended For You" movies={formatMovies(topRated || [])} />
            <MovieSection title="🆕 New Releases" movies={formatMovies(newReleases || [])} />
            <MovieSection title="⭐ Top Rated" movies={formatMovies(topRated || [])} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
