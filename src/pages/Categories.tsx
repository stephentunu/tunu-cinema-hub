import { Layout } from "@/components/layout/Layout";
import { useGenres } from "@/hooks/useGenres";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Categories = () => {
  const { data: genres, isLoading } = useGenres();

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          📂 Categories
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres?.map((genre, index) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/search?genre=${genre.slug}`}
                  className="block group"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden glass border border-white/5 group-hover:border-primary/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <span className="text-4xl mb-2">{genre.icon}</span>
                      <h3 className="font-heading font-semibold text-lg text-foreground text-center">
                        {genre.name}
                      </h3>
                      {genre.description && (
                        <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                          {genre.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Categories;
