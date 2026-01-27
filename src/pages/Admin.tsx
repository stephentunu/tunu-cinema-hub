import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Users,
  Film,
  Download,
  Plus,
  Edit,
  Trash2,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MovieForm } from "@/components/admin/MovieForm";
import { SeriesForm } from "@/components/admin/SeriesForm";
import type { Movie } from "@/hooks/useMovies";
import type { Series } from "@/hooks/useSeries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "movies" | "series" | "users">("dashboard");
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Stats queries
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [moviesRes, seriesRes, profilesRes, downloadsRes] = await Promise.all([
        supabase.from("movies").select("id", { count: "exact", head: true }),
        supabase.from("series").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("downloads").select("id", { count: "exact", head: true }),
      ]);

      return {
        movies: moviesRes.count || 0,
        series: seriesRes.count || 0,
        users: profilesRes.count || 0,
        downloads: downloadsRes.count || 0,
      };
    },
    enabled: isAdmin,
  });

  const { data: allMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
    enabled: isAdmin && activeTab === "movies",
  });

  const { data: allSeries, isLoading: seriesLoading } = useQuery({
    queryKey: ["admin-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Series[];
    },
    enabled: isAdmin && activeTab === "series",
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin && activeTab === "users",
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (movieId: string) => {
      const { error } = await supabase.from("movies").delete().eq("id", movieId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Movie deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete movie");
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: async (seriesId: string) => {
      // First delete episodes
      await supabase.from("episodes").delete().eq("series_id", seriesId);
      // Then delete series
      const { error } = await supabase.from("series").delete().eq("id", seriesId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Series deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete series");
    },
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "movies", label: "Movies", icon: Film },
    { id: "series", label: "Series", icon: Film },
    { id: "users", label: "Users", icon: Users },
  ] as const;

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setShowMovieForm(true);
  };

  const handleEditSeries = (series: Series) => {
    setEditingSeries(series);
    setShowSeriesForm(true);
  };

  const closeMovieForm = () => {
    setShowMovieForm(false);
    setEditingMovie(null);
  };

  const closeSeriesForm = () => {
    setShowSeriesForm(false);
    setEditingSeries(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 gradient-text">
          🛠️ Admin Panel
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Movies", value: stats?.movies || 0, icon: Film, color: "text-primary" },
                { label: "Total Series", value: stats?.series || 0, icon: Film, color: "text-secondary" },
                { label: "Total Users", value: stats?.users || 0, icon: Users, color: "text-accent" },
                { label: "Total Downloads", value: stats?.downloads || 0, icon: Download, color: "text-success" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-heading font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-10 h-10 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6 border border-white/10">
              <h3 className="font-heading text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="gradient"
                  onClick={() => {
                    setActiveTab("movies");
                    setShowMovieForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Movie
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActiveTab("series");
                    setShowSeriesForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Series
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("users")}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Movies Tab */}
        {activeTab === "movies" && (
          <div className="space-y-6">
            {showMovieForm ? (
              <MovieForm
                movie={editingMovie}
                onSuccess={closeMovieForm}
                onCancel={closeMovieForm}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-semibold">Movies</h2>
                  <Button variant="gradient" onClick={() => setShowMovieForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Movie
                  </Button>
                </div>

                {moviesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="glass rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Movie</th>
                            <th className="text-left p-4 font-medium">Year</th>
                            <th className="text-left p-4 font-medium">Duration</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Views</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allMovies?.map((movie) => (
                            <tr key={movie.id} className="border-t border-white/5 hover:bg-muted/20">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={movie.poster_url || "https://via.placeholder.com/50x75"}
                                    alt={movie.title}
                                    className="w-10 h-14 object-cover rounded"
                                  />
                                  <div>
                                    <span className="font-medium block">{movie.title}</span>
                                    {movie.video_url && (
                                      <span className="text-xs text-success">✓ Video uploaded</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">{movie.release_year}</td>
                              <td className="p-4 text-muted-foreground">
                                {movie.duration_minutes ? `${movie.duration_minutes} min` : "—"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    movie.status === "published"
                                      ? "bg-success/20 text-success"
                                      : movie.status === "draft"
                                      ? "bg-warning/20 text-warning"
                                      : "bg-muted/50 text-muted-foreground"
                                  }`}
                                >
                                  {movie.status}
                                </span>
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {movie.view_count?.toLocaleString()}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEditMovie(movie)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => setDeleteMovieId(movie.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Series Tab */}
        {activeTab === "series" && (
          <div className="space-y-6">
            {showSeriesForm ? (
              <SeriesForm
                series={editingSeries}
                onSuccess={closeSeriesForm}
                onCancel={closeSeriesForm}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-semibold">Series</h2>
                  <Button variant="gradient" onClick={() => setShowSeriesForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Series
                  </Button>
                </div>

                {seriesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="glass rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Series</th>
                            <th className="text-left p-4 font-medium">Seasons</th>
                            <th className="text-left p-4 font-medium">Rating</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allSeries?.map((series) => (
                            <tr key={series.id} className="border-t border-white/5 hover:bg-muted/20">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={series.poster_url || "https://via.placeholder.com/50x75"}
                                    alt={series.title}
                                    className="w-10 h-14 object-cover rounded"
                                  />
                                  <span className="font-medium">{series.title}</span>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">{series.total_seasons}</td>
                              <td className="p-4">{series.rating?.toFixed(1) || "N/A"}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    series.status === "published"
                                      ? "bg-success/20 text-success"
                                      : "bg-muted/50 text-muted-foreground"
                                  }`}
                                >
                                  {series.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEditSeries(series)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => setDeleteSeriesId(series.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold">Users</h2>

            {usersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="glass rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-medium">User</th>
                        <th className="text-left p-4 font-medium">Username</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium">Joined</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((profile: any) => (
                        <tr key={profile.id} className="border-t border-white/5 hover:bg-muted/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                {profile.username?.[0]?.toUpperCase() || "U"}
                              </div>
                              <span className="font-medium">{profile.full_name || "No name"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{profile.username || "—"}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                profile.user_roles?.some((r: any) => r.role === "admin")
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              {profile.user_roles?.find((r: any) => r.role === "admin") ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <Button size="icon" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Movie Dialog */}
      <AlertDialog open={!!deleteMovieId} onOpenChange={() => setDeleteMovieId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movie</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this movie? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteMovieId) {
                  deleteMovieMutation.mutate(deleteMovieId);
                  setDeleteMovieId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Series Dialog */}
      <AlertDialog open={!!deleteSeriesId} onOpenChange={() => setDeleteSeriesId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this series and all its episodes? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteSeriesId) {
                  deleteSeriesMutation.mutate(deleteSeriesId);
                  setDeleteSeriesId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Admin;
