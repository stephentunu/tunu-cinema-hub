import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";

interface MovieSectionProps {
  title: string;
  movies: Array<{
    id: string | number;
    title: string;
    year: string;
    rating: number;
    poster: string;
    genre?: string;
    slug?: string;
    isSeries?: boolean;
  }>;
}

export const MovieSection = ({ title, movies }: MovieSectionProps) => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <motion.button
          whileHover={{ x: 4 }}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          See All
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <MovieCard {...movie} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
