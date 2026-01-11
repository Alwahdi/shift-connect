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
    <section className="py-20 md:py-28 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            {t("home.features.title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            {t("home.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group p-6 md:p-7 rounded-2xl md:rounded-3xl bg-card border border-border/80 shadow-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 touch-manipulation"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
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