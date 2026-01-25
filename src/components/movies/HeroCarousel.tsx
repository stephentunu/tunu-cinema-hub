import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCosmic from "@/assets/hero-cosmic.jpg";

const featuredMovies = [
  {
    id: 1,
    title: "Cosmic Odyssey",
    tagline: "Beyond the stars lies humanity's destiny",
    description: "An epic space adventure following a crew of astronauts as they embark on the first interstellar journey to save Earth.",
    rating: 8.7,
    year: "2024",
    duration: "2h 34m",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    backdrop: heroCosmic,
  },
  {
    id: 2,
    title: "Shadow Protocol",
    tagline: "Trust no one. Suspect everyone.",
    description: "A covert operative uncovers a conspiracy that threatens global security, forcing them to go rogue.",
    rating: 8.4,
    year: "2024",
    duration: "2h 12m",
    genres: ["Action", "Thriller"],
    backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920&q=80",
  },
  {
    id: 3,
    title: "Eternal Night",
    tagline: "Some secrets are better left buried",
    description: "A supernatural thriller where an ancient evil awakens in a small coastal town, and only one detective can stop it.",
    rating: 8.1,
    year: "2024",
    duration: "1h 58m",
    genres: ["Horror", "Mystery"],
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
  },
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const movie = featuredMovies[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdrop})` }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl space-y-6"
              >
                {/* Genres */}
                <div className="flex gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                {/* Title */}
                <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground">
                  {movie.title}
                </h1>
                
                {/* Tagline */}
                <p className="text-xl text-accent italic">
                  "{movie.tagline}"
                </p>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="text-warning font-bold text-lg">{movie.rating}</span>
                    <span>/10</span>
                  </span>
                  <span>•</span>
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span>{movie.duration}</span>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {movie.description}
                </p>
                
                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button size="xl" variant="gradient">
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </Button>
                  <Button size="xl" variant="outline">
                    <Plus className="w-5 h-5" />
                    Watchlist
                  </Button>
                  <Button size="xl" variant="ghost">
                    <Info className="w-5 h-5" />
                    Details
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-foreground hover:bg-background/80 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-foreground hover:bg-background/80 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-gradient-to-r from-primary to-secondary"
                : "w-4 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
