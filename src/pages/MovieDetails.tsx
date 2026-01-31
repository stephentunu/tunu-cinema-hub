import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";

const MovieDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: movie, isLoading } = useMovie(slug || "");
  const { user } = useAuth();
  const { data: isInWatchlist } = useIsInWatchlist(movie?.id);
  const addToWatchlist = useAddToWatchlist();
  const [isWatching, setIsWatching] = useState(false);

  // Auto-play if autoplay param is set
  useEffect(() => {
    const shouldAutoplay = searchParams.get("autoplay") === "true";
    if (shouldAutoplay && movie?.video_url && user) {
      setIsWatching(true);
    }
  }, [searchParams, movie, user]);

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

  const handleWatchNow = () => {
    if (!user) {
      toast.error("Please sign in to watch movies");
      navigate("/auth");
      return;
    }
    if (!movie?.video_url) {
      toast.error("No video available for this movie");
      return;
    }
    setIsWatching(true);
  };

  const handleProgress = async (progress: number, total: number) => {
    if (!user || !movie) return;
    
    // Save watch progress every 30 seconds
    if (Math.floor(progress) % 30 === 0 && progress > 0) {
      await supabase.from("watch_history").upsert({
        user_id: user.id,
        movie_id: movie.id,
        progress_seconds: Math.floor(progress),
        total_seconds: Math.floor(total),
        completed: progress / total > 0.9,
      }, {
        onConflict: "user_id,movie_id",
      });
    }
  };

  const handleDownload = async (quality: string) => {
    if (!user) {
      toast.error("Please sign in to download movies");
      navigate("/auth");
      return;
    }
    if (!movie?.video_url) {
      toast.error("No video available for download");
      return;
    }

    // Log download
    await supabase.from("downloads").insert({
      user_id: user.id,
      movie_id: movie.id,
      quality,
    });

    // Open video URL for download
    window.open(movie.video_url, "_blank");
    toast.success(`Starting ${quality} download...`);
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
      {/* Video Player Modal */}
      <AnimatePresence>
        {isWatching && movie.video_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsWatching(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="w-full max-w-7xl px-4">
              <VideoPlayer
                src={movie.video_url}
                poster={movie.backdrop_url || movie.poster_url || undefined}
                title={movie.title}
                onProgress={handleProgress}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <Button 
                  size="xl" 
                  variant="gradient"
                  onClick={handleWatchNow}
                  disabled={!movie.video_url}
                >
                  <Play className="w-5 h-5 fill-current" />
                  {movie.video_url ? "Watch Now" : "Coming Soon"}
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
              {[
                { quality: "480p", size: "~500MB" },
                { quality: "720p", size: "~1.2GB" },
                { quality: "1080p", size: "~2.5GB" },
              ].map(({ quality, size }) => (
                <button
                  key={quality}
                  onClick={() => handleDownload(quality)}
                  disabled={!movie.video_url}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium">{quality}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{size}</span>
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
