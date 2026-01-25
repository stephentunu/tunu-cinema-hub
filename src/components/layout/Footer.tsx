import { Film, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[hsl(222_47%_5%)] border-t border-white/5 mt-12">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-semibold gradient-text">
                Tunu Movies
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Stream. Download. Discover. Your ultimate destination for movies and series with personalized recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["Home", "Trending", "New Releases", "Categories", "My Watchlist"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              {["Help Center", "FAQs", "Contact Us", "Terms of Service", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-accent transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground">Connect With Us</h4>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Tunu Movies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
