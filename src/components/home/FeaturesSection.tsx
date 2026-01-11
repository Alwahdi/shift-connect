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
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("home.features.title")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("home.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-5 md:p-6 rounded-xl md:rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 touch-manipulation"
            >
              <div className={`w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
