import { motion } from "framer-motion";
import { Play, Plus, Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MovieCardProps {
  id?: string | number;
  title: string;
  year: string;
  rating: number;
  poster: string;
  genre?: string;
  slug?: string;
  isSeries?: boolean;
}

export const MovieCard = ({ id, title, year, rating, poster, genre, slug, isSeries }: MovieCardProps) => {
  const linkTo = slug ? (isSeries ? `/series/${slug}` : `/movie/${slug}`) : "#";
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500" />
      
      <div className="relative bg-card rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/30 transition-all duration-300">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-warning text-warning" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Button size="sm" variant="gradient" className="flex-1 gap-1">
              <Play className="w-4 h-4" />
              Play
            </Button>
            <Button size="icon" variant="outline" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="shrink-0">
              <Download className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        {/* Info */}
        <div className="p-4 space-y-1">
          <h3 className="font-heading font-semibold text-sm text-foreground truncate">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{year}</span>
            {genre && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {genre}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
