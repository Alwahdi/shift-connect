import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/ui/skip-link";
import { Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { UserProfileMenu } from "./UserProfileMenu";
import { useAuth } from "@/contexts/AuthContext";
import { SITE_CONFIG, NAV_LINKS } from "@/config/constants";
import syndeoCarelogo from "@/assets/syndeocare-logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Skip Link for keyboard navigation */}
      <SkipLink />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-inset">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 touch-manipulation group">
            <img 
              src={syndeoCarelogo} 
              alt="SyndeoCare Logo" 
              className="h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher variant="text" />
            {user ? (
              <>
                <Link to="/messages">
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <NotificationCenter />
                <UserProfileMenu />
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="default" className="font-medium">
                    {t("common.logIn")}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="default" className="font-medium shadow-lg">
                    {t("common.getStarted")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              className="p-3 rounded-xl hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-background/98 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-5 space-y-2 safe-area-inset-bottom">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-4 rounded-xl text-base font-medium transition-all touch-manipulation ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground active:bg-secondary"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              
              <div className="flex items-center justify-between pt-5 border-t border-border mt-4">
                <LanguageSwitcher variant="full" />
              </div>
              
              {user ? (
                <div className="pt-4 space-y-3">
                  <Link to="/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary" onClick={() => setMobileMenuOpen(false)}>
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{t("chat.messages")}</span>
                  </Link>
                  <UserProfileMenu />
                </div>
              ) : (
                <div className="flex gap-3 pt-4">
                  <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-13 text-base font-medium">
                      {t("common.logIn")}
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full h-13 text-base font-medium">
                      {t("common.getStarted")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
