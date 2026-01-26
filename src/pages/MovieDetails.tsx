import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useMovie } from "@/hooks/useMovies";
import { useAddToWatchlist, useIsInWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import {
  Play,
  Plus,
  Check,
  Download,
  Star,
  Clock,
  Calendar,
  Globe,
  Film,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MovieDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: movie, isLoading } = useMovie(slug || "");
  const { user } = useAuth();
  const { data: isInWatchlist } = useIsInWatchlist(movie?.id);
  const addToWatchlist = useAddToWatchlist();

  const handleAddToWatchlist = async () => {
    if (!user) {
      toast.error("Please sign in to add to watchlist");
      return;
    }
    if (!movie) return;

    try {
      await addToWatchlist.mutateAsync({ movieId: movie.id });
      toast.success("Added to watchlist");
    } catch (error) {
      toast.error("Failed to add to watchlist");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!movie) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Movie not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-[70vh]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop_url || movie.poster_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

        {/* Content */}
        <div className="relative container mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="shrink-0"
            >
              <img
                src={movie.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80"}
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-2xl shadow-2xl border border-white/10"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 space-y-6"
            >
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-xl text-accent italic">"{movie.tagline}"</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/20 text-warning">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{movie.rating?.toFixed(1) || "N/A"}</span>
                  <span className="text-warning/70">({movie.rating_count || 0} votes)</span>
                </div>
                {movie.release_year && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.release_year}</span>
                  </div>
                )}
                {movie.duration_minutes && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m</span>
                  </div>
                )}
                {movie.language && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{movie.language}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {movie.description}
              </p>

              {/* Director & Cast */}
              <div className="space-y-2">
                {movie.director && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Director:</span>{" "}
                    <span className="text-foreground">{movie.director}</span>
                  </p>
                )}
                {movie.cast_members && movie.cast_members.length > 0 && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Cast:</span>{" "}
                    <span className="text-foreground">{movie.cast_members.join(", ")}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="xl" variant="gradient">
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={handleAddToWatchlist}
                  disabled={isInWatchlist || addToWatchlist.isPending}
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="w-5 h-5" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
                <Button size="xl" variant="outline">
                  <Download className="w-5 h-5" />
                  Download
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stats */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="font-heading text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted/30">
                <Film className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{movie.view_count?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/30">
                <Download className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{movie.download_count?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Downloads</p>
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="font-heading text-lg font-semibold mb-4">Download Options</h3>
            <div className="space-y-3">
              {["480p", "720p", "1080p"].map((quality) => (
                <button
                  key={quality}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{quality}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{quality === "480p" ? "~500MB" : quality === "720p" ? "~1.2GB" : "~2.5GB"}</span>
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MovieDetails;
