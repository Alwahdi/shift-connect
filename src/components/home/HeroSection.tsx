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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 end-10 w-56 md:w-80 h-56 md:h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 start-10 w-72 md:w-[28rem] h-72 md:h-[28rem] bg-sky/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium border border-white/20 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              {t("home.hero.trustedBy")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.15] mb-8 tracking-tight"
          >
            {t("home.hero.title").split(",")[0]},{" "}
            <span className="text-accent">{t("home.hero.title").split(",")[1] || "Simplified"}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/80 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-20 px-4"
          >
            <Link to="/auth?mode=signup&role=professional" className="w-full sm:w-auto">
              <Button variant="accent" size="xl" className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[200px]">
                <Users className="w-5 h-5 me-2" />
                {t("auth.imProfessional")}
                <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup&role=clinic" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white hover:text-primary bg-white/5 backdrop-blur-sm transition-all duration-300 min-w-[200px]"
              >
                <Building2 className="w-5 h-5 me-2" />
                {t("auth.imClinic")}
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/15 shadow-xl"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-2">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-accent fill-accent" />}
                </div>
                <div className="text-xs sm:text-sm text-white/70 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
