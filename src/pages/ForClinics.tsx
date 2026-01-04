import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Clock, 
  Shield, 
  TrendingUp,
  ArrowRight,
  Zap,
  FileCheck
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ForClinics = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Users,
      title: t("clinics.benefits.verified"),
      description: t("clinics.benefits.verifiedDesc")
    },
    {
      icon: Zap,
      title: t("clinics.benefits.fast"),
      description: t("clinics.benefits.fastDesc")
    },
    {
      icon: FileCheck,
      title: t("profile.documents"),
      description: t("home.features.verification.desc")
    },
    {
      icon: Shield,
      title: t("about.values.quality"),
      description: t("about.values.qualityDesc")
    },
    {
      icon: Clock,
      title: t("home.features.booking.title"),
      description: t("home.features.booking.desc")
    },
    {
      icon: TrendingUp,
      title: t("clinics.benefits.flexible"),
      description: t("clinics.benefits.flexibleDesc")
    }
  ];

  const steps = [
    { number: "01", title: t("home.howItWorks.clinics.step1.title"), description: t("home.howItWorks.clinics.step1.desc") },
    { number: "02", title: t("home.howItWorks.clinics.step2.title"), description: t("home.howItWorks.clinics.step2.desc") },
    { number: "03", title: t("home.features.matching.title"), description: t("home.features.matching.desc") },
    { number: "04", title: t("home.howItWorks.clinics.step3.title"), description: t("home.howItWorks.clinics.step3.desc") }
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
              >
                <Building2 className="w-4 h-4" />
                {t("nav.forClinics")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                {t("clinics.hero.title")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                {t("clinics.hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                  <Link to="/auth?mode=signup&role=clinic">
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
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-accent-foreground" />
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
                  <div className="text-5xl font-bold text-accent/20 mb-4">{step.number}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: t("nav.forClinics").replace("For ", "").replace("للعيادات", "منشأة") },
                { value: "10K+", label: t("nav.forProfessionals").replace("For ", "").replace("للمهنيين", "مهني") },
                { value: "95%", label: t("dashboard.stats.fillRate") },
                { value: "4.8★", label: t("dashboard.stats.avgRating") }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-accent-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("home.cta.title")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("home.cta.subtitle")}
              </p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/auth?mode=signup&role=clinic">
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

export default ForClinics;
