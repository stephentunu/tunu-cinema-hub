import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movies/MovieCard";
import { useMovies } from "@/hooks/useMovies";
import { useSeries } from "@/hooks/useSeries";
import { useGenres } from "@/hooks/useGenres";
import { Search as SearchIcon, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "series">("all");
  const [minRating, setMinRating] = useState<number>(0);

  const { data: movies, isLoading: moviesLoading } = useMovies();
  const { data: series, isLoading: seriesLoading } = useSeries();
  const { data: genres } = useGenres();

  const isLoading = moviesLoading || seriesLoading;

  // Filter and search logic
  const filteredMovies = movies?.filter((m) => {
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedYear && m.release_year?.toString() !== selectedYear) return false;
    if (minRating && (m.rating || 0) < minRating) return false;
    return true;
  }) || [];

  const filteredSeries = series?.filter((s) => {
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedYear && s.release_year?.toString() !== selectedYear) return false;
    if (minRating && (s.rating || 0) < minRating) return false;
    return true;
  }) || [];

  const formatMoviesForCard = (movies: any[]) =>
    movies.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.release_year?.toString() || "N/A",
      rating: m.rating || 0,
      poster: m.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
      genre: m.language || "English",
      slug: m.slug,
    }));

  const formatSeriesForCard = (series: any[]) =>
    series.map((s) => ({
      id: s.id,
      title: s.title,
      year: s.release_year?.toString() || "N/A",
      rating: s.rating || 0,
      poster: s.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
      genre: `${s.total_seasons || 1} Season${(s.total_seasons || 1) > 1 ? "s" : ""}`,
      slug: s.slug,
      isSeries: true,
    }));

  const displayResults = [
    ...(selectedType === "all" || selectedType === "movie" ? formatMoviesForCard(filteredMovies) : []),
    ...(selectedType === "all" || selectedType === "series" ? formatSeriesForCard(filteredSeries) : []),
  ];

  const years = Array.from({ length: 30 }, (_, i) => (2024 - i).toString());

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          🔍 Search
        </h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search movies, series, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-card/50 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all text-lg"
            />
          </div>
          <Button
            variant={showFilters ? "gradient" : "outline"}
            size="xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl p-6 mb-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-lg">Filters</h3>
                  <button
                    onClick={() => {
                      setSelectedGenre("");
                      setSelectedYear("");
                      setSelectedType("all");
                      setMinRating(0);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Type</label>
                    <div className="flex gap-2">
                      {(["all", "movie", "series"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                            selectedType === type
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-white/10 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">All Genres</option>
                      {genres?.map((genre) => (
                        <option key={genre.id} value={genre.slug}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-white/10 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">All Years</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Min Rating: {minRating}+
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayResults.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No results found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              {displayResults.length} result{displayResults.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayResults.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <MovieCard {...item} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
