import { Layout } from "@/components/layout/Layout";
import { MovieSection } from "@/components/movies/MovieSection";
import { useTopRatedMovies, useTrendingMovies } from "@/hooks/useMovies";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Recommendations = () => {
  const { user } = useAuth();
  const { data: topRated, isLoading: topRatedLoading } = useTopRatedMovies();
  const { data: trending, isLoading: trendingLoading } = useTrendingMovies();

  const isLoading = topRatedLoading || trendingLoading;

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

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-4">
            Sign in for personalized recommendations
          </h1>
          <p className="text-muted-foreground mb-8">
            We'll suggest movies based on your watch history and preferences
          </p>
          <Link to="/auth">
            <Button variant="gradient" size="xl">
              Sign In
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-2 gradient-text">
          ✨ For You
        </h1>
        <p className="text-muted-foreground mb-8">
          Personalized recommendations based on your viewing history
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <MovieSection
              title="Because you might like"
              movies={formatMoviesForSection(topRated || [])}
            />
            <MovieSection
              title="Popular picks for you"
              movies={formatMoviesForSection(trending || [])}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recommendations;
