import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const continueWatchingData = [
  {
    id: 1,
    title: "The Last Kingdom",
    episode: "S05 E08",
    progress: 65,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    duration: "45 min left",
  },
  {
    id: 2,
    title: "Dark Matter",
    episode: "S02 E03",
    progress: 30,
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80",
    duration: "32 min left",
  },
  {
    id: 3,
    title: "Inception",
    episode: "Movie",
    progress: 80,
    thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80",
    duration: "28 min left",
  },
];

export const ContinueWatching = () => {
  return (
    <section className="py-8">
      <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
        Continue Watching
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {continueWatchingData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="flex gap-4 p-3 rounded-xl bg-card/50 border border-white/5 hover:border-primary/30 transition-all duration-300">
              {/* Thumbnail */}
              <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="icon" variant="gradient" className="w-10 h-10 rounded-full">
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.episode}</p>
                <p className="text-xs text-accent mt-2">{item.duration}</p>
              </div>
              
              {/* Remove Button */}
              <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300">
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
