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
    },
    {
      icon: Zap,
      title: t("home.features.matching.title"),
      description: t("home.features.matching.desc"),
    },
    {
      icon: MapPin,
      title: t("professionals.benefits.verified"),
      description: t("professionals.benefits.verifiedDesc"),
    },
    {
      icon: Calendar,
      title: t("professionals.benefits.flexibility"),
      description: t("professionals.benefits.flexibilityDesc"),
    },
    {
      icon: Star,
      title: t("dashboard.stats.avgRating"),
      description: t("home.features.booking.desc"),
    },
    {
      icon: CreditCard,
      title: t("home.features.payments.title"),
      description: t("home.features.payments.desc"),
    },
    {
      icon: Clock,
      title: t("clinics.benefits.fast"),
      description: t("clinics.benefits.fastDesc"),
    },
    {
      icon: FileCheck,
      title: t("profile.documents"),
      description: t("home.features.booking.desc"),
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("home.features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
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
