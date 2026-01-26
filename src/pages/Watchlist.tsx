import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movies/MovieCard";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Watchlist = () => {
  const { user } = useAuth();
  const { data: watchlist, isLoading } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-4">Sign in to view your watchlist</h1>
          <p className="text-muted-foreground mb-8">
            Keep track of movies and shows you want to watch
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

  const handleRemove = async (id: string) => {
    try {
      await removeFromWatchlist.mutateAsync(id);
      toast.success("Removed from watchlist");
    } catch (error) {
      toast.error("Failed to remove from watchlist");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          ❤️ My Watchlist
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !watchlist || watchlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-8">
              Start adding movies and series to keep track of what you want to watch
            </p>
            <Link to="/movies">
              <Button variant="gradient" size="lg">
                Browse Movies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((item: any, index: number) => {
              const content = item.movies || item.series;
              if (!content) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MovieCard
                    title={content.title}
                    year={content.release_year?.toString() || "N/A"}
                    rating={content.rating || 0}
                    poster={content.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80"}
                    genre={item.series ? `${content.total_seasons || 1} Seasons` : content.language}
                    slug={content.slug}
                    isSeries={!!item.series}
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-destructive/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Watchlist;
