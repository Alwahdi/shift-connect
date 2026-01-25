import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  MapPin, 
  Calendar, 
  Star, 
  CreditCard,
  Clock,
  FileCheck
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t("home.features.verification.title"),
      description: t("home.features.verification.desc"),
      gradient: "gradient-primary",
    },
    {
      icon: Zap,
      title: t("home.features.matching.title"),
      description: t("home.features.matching.desc"),
      gradient: "gradient-accent",
    },
    {
      icon: MapPin,
      title: t("professionals.benefits.verified"),
      description: t("professionals.benefits.verifiedDesc"),
      gradient: "gradient-sky",
    },
    {
      icon: Calendar,
      title: t("professionals.benefits.flexibility"),
      description: t("professionals.benefits.flexibilityDesc"),
      gradient: "gradient-primary",
    },
    {
      icon: Star,
      title: t("dashboard.stats.avgRating"),
      description: t("home.features.booking.desc"),
      gradient: "gradient-accent",
    },
    {
      icon: CreditCard,
      title: t("home.features.payments.title"),
      description: t("home.features.payments.desc"),
      gradient: "gradient-sky",
    },
    {
      icon: Clock,
      title: t("clinics.benefits.fast"),
      description: t("clinics.benefits.fastDesc"),
      gradient: "gradient-primary",
    },
    {
      icon: FileCheck,
      title: t("profile.documents"),
      description: t("home.features.booking.desc"),
      gradient: "gradient-accent",
    },
  ];

  return (
    <section className="py-20 md:py-28 lg:py-32 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            {t("home.features.title")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            {t("home.features.subtitle")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Everything you need to streamline dental staffing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative p-6 md:p-7 rounded-2xl md:rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 touch-manipulation overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl md:rounded-3xl" />
              
              <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300 shadow-lg`}>
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="relative text-lg md:text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="relative text-sm md:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;