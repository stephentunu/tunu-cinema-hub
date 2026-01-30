import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Header = ({ onMenuClick, showMenuButton }: HeaderProps) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/5">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
        {/* Left section with menu and search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile menu button */}
          {showMenuButton && (
            <motion.button
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </motion.button>
          )}

          {/* Search Bar */}
          <motion.div
            className={cn(
              "relative flex items-center transition-all duration-300 flex-1",
              searchFocused ? "sm:max-w-md" : "sm:max-w-xs",
              "max-w-full"
            )}
          >
            <Search className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchFocused ? "Search movies, series, actors..." : "Search..."}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 rounded-full bg-muted/50 border border-transparent",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-primary/50 focus:bg-muted",
                "transition-all duration-300"
              )}
            />
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 ml-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
          </motion.button>

          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">Guest User</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
