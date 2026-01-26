import { Layout } from "@/components/layout/Layout";
import { MovieSection } from "@/components/movies/MovieSection";
import { useNewReleases } from "@/hooks/useMovies";
import { Loader2 } from "lucide-react";

const NewReleases = () => {
  const { data: movies, isLoading } = useNewReleases();

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

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          🆕 New Releases
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {formatMoviesForSection(movies || []).map((movie, index) => (
              <div key={movie.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

import { MovieCard } from "@/components/movies/MovieCard";

export default NewReleases;
