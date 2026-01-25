import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search Bar */}
        <motion.div
          className={cn(
            "relative flex items-center transition-all duration-300",
            searchFocused ? "w-96" : "w-72"
          )}
        >
          <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies, series, actors..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-transparent",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary/50 focus:bg-muted",
              "transition-all duration-300"
            )}
          />
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
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
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
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
