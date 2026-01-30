import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  TrendingUp,
  Film,
  Tv,
  Grid3X3,
  Search,
  Heart,
  Download,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Play,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Play, label: "New Releases", path: "/new-releases" },
  { icon: Film, label: "Movies", path: "/movies" },
  { icon: Tv, label: "Series", path: "/series" },
  { icon: Grid3X3, label: "Categories", path: "/categories" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Heart, label: "Watchlist", path: "/watchlist" },
  { icon: Download, label: "Downloads", path: "/downloads" },
  { icon: Sparkles, label: "For You", path: "/recommendations" },
];

const bottomItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Admin", path: "/admin" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile, onClose]);

  // For mobile, we use the isOpen prop to control visibility
  // For desktop, sidebar is always visible
  const showSidebar = isMobile ? isOpen : true;

  if (!showSidebar && isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={isMobile ? { x: -280 } : false}
        animate={{ 
          width: isMobile ? 280 : (isCollapsed ? 80 : 260),
          x: 0 
        }}
        exit={isMobile ? { x: -280 } : undefined}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen glass-sidebar z-50 flex flex-col",
          isMobile && "shadow-2xl"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow"
              whileHover={{ scale: 1.05 }}
            >
              <Film className="w-5 h-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-heading text-xl font-semibold gradient-text"
                >
                  Tunu
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile close button */}
          {isMobile && (
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "nav-link group",
                      isActive && "active bg-muted/50"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <AnimatePresence>
                      {(!isCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "text-sm transition-colors duration-300",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/5 py-4 px-3">
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "nav-link group",
                      isActive && "active bg-muted/50"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <AnimatePresence>
                      {(!isCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "text-sm transition-colors duration-300",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              );
            })}
            <li>
              <button className="nav-link group w-full">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-muted-foreground group-hover:text-destructive transition-colors duration-300"
                >
                  <LogOut className="w-5 h-5" />
                </motion.div>
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-muted-foreground group-hover:text-destructive transition-colors duration-300"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          </ul>
        </div>

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg neon-glow"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </motion.button>
        )}
      </motion.aside>
    </>
  );
};

// Export menu trigger for use in header
export const MobileMenuTrigger = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-muted/50 transition-colors lg:hidden"
    whileTap={{ scale: 0.95 }}
  >
    <Menu className="w-6 h-6 text-foreground" />
  </motion.button>
);
