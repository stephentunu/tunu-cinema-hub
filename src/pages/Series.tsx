import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movies/MovieCard";
import { useSeries } from "@/hooks/useSeries";
import { Loader2 } from "lucide-react";

const Series = () => {
  const { data: series, isLoading } = useSeries();

  const formatSeriesForSection = (series: any[]) =>
    series?.map((s) => ({
      id: s.id,
      title: s.title,
      year: s.release_year?.toString() || "N/A",
      rating: s.rating || 0,
      poster: s.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
      genre: `${s.total_seasons || 1} Season${(s.total_seasons || 1) > 1 ? "s" : ""}`,
      slug: s.slug,
      isSeries: true,
    })) || [];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          📺 TV Series
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {formatSeriesForSection(series || []).map((item, index) => (
              <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <MovieCard {...item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Series;
