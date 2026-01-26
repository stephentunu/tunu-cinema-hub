import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Downloads = () => {
  const { user } = useAuth();

  const { data: downloads, isLoading } = useQuery({
    queryKey: ["downloads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("downloads")
        .select(`
          *,
          movies(*),
          episodes(*, series(*))
        `)
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-4">Sign in to view your downloads</h1>
          <p className="text-muted-foreground mb-8">
            Access your downloaded movies and shows offline
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
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          ⬇️ My Downloads
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !downloads || downloads.length === 0 ? (
          <div className="text-center py-20">
            <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-semibold mb-2">No downloads yet</h2>
            <p className="text-muted-foreground mb-8">
              Download movies and episodes to watch offline
            </p>
            <Link to="/movies">
              <Button variant="gradient" size="lg">
                Browse Movies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((download: any, index: number) => {
              const content = download.movies || download.episodes?.series;
              const isEpisode = !!download.episodes;

              return (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-4 border border-white/5 flex items-center gap-4"
                >
                  <img
                    src={content?.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80"}
                    alt={content?.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg">{content?.title}</h3>
                    {isEpisode && (
                      <p className="text-sm text-muted-foreground">
                        S{download.episodes.season_number} E{download.episodes.episode_number} - {download.episodes.title}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">
                        {download.quality}
                      </span>
                      <span>
                        {new Date(download.downloaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Redownload
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Downloads;
