import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Users, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 end-10 w-48 md:w-72 h-48 md:h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 start-10 w-64 md:w-96 h-64 md:h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium border border-primary/20 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              {t("home.hero.trustedBy")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6"
          >
            {t("home.hero.title").split(",")[0]},{" "}
            <span className="text-accent">{t("home.hero.title").split(",")[1] || "Simplified"}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 md:mb-10 max-w-2xl mx-auto px-4"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 md:mb-16 px-4"
          >
            <Link to="/auth?mode=signup&role=professional" className="w-full sm:w-auto">
              <Button variant="accent" size="xl" className="w-full sm:w-auto">
                <Users className="w-5 h-5 me-2" />
                {t("auth.imProfessional")}
                <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup&role=clinic" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
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
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto bg-card/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-primary-foreground/10"
          >
            {[
              { value: "10,000+", label: t("nav.forProfessionals").replace("For ", "").replace("للمهنيين", "مهني") },
              { value: "500+", label: t("nav.forClinics").replace("For ", "").replace("للعيادات", "عيادة") },
              { value: "50,000+", label: t("dashboard.completedShifts") },
              { value: "4.9★", label: t("dashboard.stats.avgRating") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
