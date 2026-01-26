import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Camera, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: watchHistory } = useQuery({
    queryKey: ["watch-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watch_history")
        .select("*, movies(*)")
        .eq("user_id", user.id)
        .order("last_watched_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-4">Sign in to view your profile</h1>
          <p className="text-muted-foreground mb-8">
            Manage your account and preferences
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
          👤 My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="font-heading text-xl font-semibold">
                {profile?.username || profile?.full_name || "User"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>

              {isAdmin && (
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  Admin
                </span>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/watchlist">My Watchlist</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/downloads">My Downloads</Link>
              </Button>
              {isAdmin && (
                <Button variant="gradient" className="w-full" asChild>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Watchlist", value: "12" },
                { label: "Downloaded", value: "8" },
                { label: "Reviews", value: "5" },
                { label: "Watch Time", value: "42h" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-xl p-4 border border-white/10 text-center"
                >
                  <p className="text-2xl font-heading font-bold gradient-text">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Watch History */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-heading text-lg font-semibold mb-4">
                Recent Activity
              </h3>
              {watchHistory && watchHistory.length > 0 ? (
                <div className="space-y-3">
                  {watchHistory.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <img
                        src={item.movies?.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80"}
                        alt={item.movies?.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.movies?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((item.progress_seconds / (item.total_seconds || 1)) * 100)}% watched
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.last_watched_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No watch history yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
