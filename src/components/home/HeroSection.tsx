import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Users, Building2, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PLATFORM_STATS } from "@/config/constants";

const HeroSection = () => {
  const { t } = useTranslation();

  // Stats using centralized configuration
  const stats = [
    { 
      value: PLATFORM_STATS.professionals.value, 
      label: t("stats.professionals"),
      icon: null 
    },
    { 
      value: PLATFORM_STATS.facilities.value, 
      label: t("stats.facilities"),
      icon: null 
    },
    { 
      value: PLATFORM_STATS.completedShifts.value, 
      label: t("stats.completedShifts"),
      icon: null 
    },
    { 
      value: PLATFORM_STATS.averageRating.value, 
      label: t("stats.avgRating"),
      icon: Star 
    },
  ];

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 lg:pt-44 lg:pb-36 gradient-hero overflow-hidden">
      {/* Background decoration - Brand Purple & Teal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Teal accent glow - top right */}
        <div className="absolute top-10 end-0 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
        {/* Purple primary glow - bottom left */}
        <div className="absolute bottom-10 start-0 w-72 md:w-[30rem] h-72 md:h-[30rem] bg-primary/15 rounded-full blur-[120px]" />
        {/* Center blend glow */}
        <div className="absolute top-1/3 start-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-primary/10 via-accent/8 to-transparent rounded-full blur-3xl" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 start-1/4 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 end-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl text-white text-sm font-medium border border-white/25 shadow-2xl">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              {t("home.hero.trustedBy")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight"
          >
            {t("home.hero.title").split(",")[0]},{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-sky">{t("home.hero.title").split(",")[1] || "Simplified"}</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-lg md:text-xl text-white/85 mb-12 md:mb-14 max-w-2xl mx-auto leading-relaxed px-4"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-20 px-4"
          >
            <Link to="/auth?mode=signup&role=professional" className="w-full sm:w-auto">
              <Button variant="accent" size="xl" className="w-full sm:w-auto shadow-2xl hover:shadow-glow-teal transition-all duration-300 min-w-[220px] border border-white/20">
                <Users className="w-5 h-5 me-2" />
                {t("auth.imProfessional")}
                <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup&role=clinic" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-md transition-all duration-300 min-w-[220px]"
              >
                <Building2 className="w-5 h-5 me-2" />
                {t("auth.imClinic")}
              </Button>
            </Link>
          </motion.div>

          {/* Stats - Brand glassmorphism card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-6 md:p-10 border border-white/20 shadow-2xl"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                className="text-center py-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-accent fill-accent" />}
                </div>
                <div className="text-xs sm:text-sm text-white/75 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
