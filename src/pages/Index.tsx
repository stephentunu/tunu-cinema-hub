import { Layout } from "@/components/layout/Layout";
import { HeroCarousel } from "@/components/movies/HeroCarousel";
import { ContinueWatching } from "@/components/movies/ContinueWatching";
import { MovieSection } from "@/components/movies/MovieSection";

// Import poster images
import posterScifi1 from "@/assets/poster-scifi-1.jpg";
import posterAction1 from "@/assets/poster-action-1.jpg";
import posterHero1 from "@/assets/poster-hero-1.jpg";
import posterDrama1 from "@/assets/poster-drama-1.jpg";
import posterFantasy1 from "@/assets/poster-fantasy-1.jpg";

// Sample movie data with custom posters
const trendingMovies = [
  { id: 1, title: "Dune: Part Two", year: "2024", rating: 8.8, poster: posterScifi1, genre: "Sci-Fi" },
  { id: 2, title: "Oppenheimer", year: "2023", rating: 8.9, poster: posterDrama1, genre: "Drama" },
  { id: 3, title: "The Batman", year: "2022", rating: 8.5, poster: posterHero1, genre: "Action" },
  { id: 4, title: "Avatar 2", year: "2022", rating: 7.8, poster: posterFantasy1, genre: "Sci-Fi" },
  { id: 5, title: "Top Gun: Maverick", year: "2022", rating: 8.6, poster: posterAction1, genre: "Action" },
  { id: 6, title: "Interstellar", year: "2014", rating: 9.0, poster: posterScifi1, genre: "Sci-Fi" },
];

const newReleases = [
  { id: 7, title: "Gladiator II", year: "2024", rating: 8.2, poster: posterAction1, genre: "Action" },
  { id: 8, title: "Venom 3", year: "2024", rating: 7.4, poster: posterHero1, genre: "Action" },
  { id: 9, title: "Deadpool 3", year: "2024", rating: 8.7, poster: posterHero1, genre: "Comedy" },
  { id: 10, title: "Joker 2", year: "2024", rating: 7.9, poster: posterDrama1, genre: "Drama" },
  { id: 11, title: "Kingdom of the Planet", year: "2024", rating: 8.1, poster: posterScifi1, genre: "Sci-Fi" },
  { id: 12, title: "Wicked", year: "2024", rating: 8.5, poster: posterFantasy1, genre: "Musical" },
];

const topRated = [
  { id: 13, title: "The Shawshank Redemption", year: "1994", rating: 9.3, poster: posterDrama1, genre: "Drama" },
  { id: 14, title: "The Godfather", year: "1972", rating: 9.2, poster: posterAction1, genre: "Crime" },
  { id: 15, title: "The Dark Knight", year: "2008", rating: 9.0, poster: posterHero1, genre: "Action" },
  { id: 16, title: "Pulp Fiction", year: "1994", rating: 8.9, poster: posterAction1, genre: "Crime" },
  { id: 17, title: "Fight Club", year: "1999", rating: 8.8, poster: posterDrama1, genre: "Drama" },
  { id: 18, title: "Inception", year: "2010", rating: 8.8, poster: posterScifi1, genre: "Sci-Fi" },
];

const recommendedForYou = [
  { id: 19, title: "Blade Runner 2049", year: "2017", rating: 8.0, poster: posterScifi1, genre: "Sci-Fi" },
  { id: 20, title: "Ex Machina", year: "2014", rating: 7.7, poster: posterFantasy1, genre: "Sci-Fi" },
  { id: 21, title: "Arrival", year: "2016", rating: 7.9, poster: posterScifi1, genre: "Sci-Fi" },
  { id: 22, title: "The Matrix", year: "1999", rating: 8.7, poster: posterHero1, genre: "Action" },
  { id: 23, title: "Tenet", year: "2020", rating: 7.3, poster: posterAction1, genre: "Action" },
  { id: 24, title: "Edge of Tomorrow", year: "2014", rating: 7.9, poster: posterScifi1, genre: "Sci-Fi" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Carousel */}
      <HeroCarousel />
      
      <div className="container mx-auto px-6 space-y-4">
        {/* Continue Watching */}
        <ContinueWatching />
        
        {/* Trending Now */}
        <MovieSection title="🔥 Trending Now" movies={trendingMovies} />
        
        {/* Recommended For You */}
        <MovieSection title="✨ Recommended For You" movies={recommendedForYou} />
        
        {/* New Releases */}
        <MovieSection title="🆕 New Releases" movies={newReleases} />
        
        {/* Top Rated */}
        <MovieSection title="⭐ Top Rated" movies={topRated} />
      </div>
    </Layout>
  );
};

export default Index;
