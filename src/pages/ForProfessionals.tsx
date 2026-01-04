import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Shield, 
  Clock,
  Star,
  ArrowRight,
  Briefcase
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ForProfessionals = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Calendar,
      title: t("professionals.benefits.flexibility"),
      description: t("professionals.benefits.flexibilityDesc")
    },
    {
      icon: DollarSign,
      title: t("professionals.benefits.topPay"),
      description: t("professionals.benefits.topPayDesc")
    },
    {
      icon: MapPin,
      title: t("shifts.location"),
      description: t("home.features.matching.desc")
    },
    {
      icon: Shield,
      title: t("professionals.benefits.verified"),
      description: t("professionals.benefits.verifiedDesc")
    },
    {
      icon: Clock,
      title: t("clinics.benefits.fast"),
      description: t("home.features.payments.desc")
    },
    {
      icon: Star,
      title: t("dashboard.stats.avgRating"),
      description: t("home.features.booking.desc")
    }
  ];

  const steps = [
    { number: "01", title: t("home.howItWorks.professionals.step1.title"), description: t("home.howItWorks.professionals.step1.desc") },
    { number: "02", title: t("home.howItWorks.professionals.step2.title"), description: t("home.howItWorks.professionals.step2.desc") },
    { number: "03", title: t("home.howItWorks.professionals.step3.title"), description: t("home.howItWorks.professionals.step3.desc") },
    { number: "04", title: t("onboarding.complete"), description: t("home.cta.subtitle") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Users className="w-4 h-4" />
                {t("nav.forProfessionals")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                {t("professionals.hero.title")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                {t("professionals.hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg">
                  <Link to="/auth?mode=signup&role=professional">
                    {t("common.getStarted")}
                    <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">
                    {t("auth.haveAccount")}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("home.features.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.features.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-background border border-border hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("home.howItWorks.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.howItWorks.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("home.cta.title")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("home.cta.subtitle")}
              </p>
              <Button asChild size="lg">
                <Link to="/auth?mode=signup&role=professional">
                  {t("common.getStarted")}
                  <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForProfessionals;
