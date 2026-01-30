import { ReactNode, useState } from "react";
import { Sidebar, MobileMenuTrigger } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile sidebar with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {(isMobile ? sidebarOpen : true) && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      <div className={`flex-1 transition-all duration-300 ${isMobile ? 'ml-0' : 'lg:ml-[260px]'}`}>
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          showMenuButton={isMobile} 
        />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[calc(100vh-64px)]"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </div>
  );
};
