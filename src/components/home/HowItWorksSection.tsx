import { motion } from "framer-motion";
import { UserPlus, FileCheck, Search, CalendarCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const professionalSteps = [
    {
      icon: UserPlus,
      title: t("home.howItWorks.professionals.step1.title"),
      description: t("home.howItWorks.professionals.step1.desc"),
    },
    {
      icon: FileCheck,
      title: t("home.howItWorks.professionals.step2.title"),
      description: t("home.howItWorks.professionals.step2.desc"),
    },
    {
      icon: Search,
      title: t("home.howItWorks.professionals.step3.title"),
      description: t("home.howItWorks.professionals.step3.desc"),
    },
    {
      icon: CalendarCheck,
      title: t("onboarding.complete"),
      description: t("home.howItWorks.professionals.step3.desc"),
    },
  ];

  const clinicSteps = [
    {
      icon: UserPlus,
      title: t("home.howItWorks.clinics.step1.title"),
      description: t("home.howItWorks.clinics.step1.desc"),
    },
    {
      icon: FileCheck,
      title: t("home.howItWorks.clinics.step2.title"),
      description: t("home.howItWorks.clinics.step2.desc"),
    },
    {
      icon: Search,
      title: t("home.howItWorks.clinics.step2.title"),
      description: t("home.howItWorks.clinics.step2.desc"),
    },
    {
      icon: CalendarCheck,
      title: t("home.howItWorks.clinics.step3.title"),
      description: t("home.howItWorks.clinics.step3.desc"),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Professionals */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold text-foreground mb-8 text-center lg:text-start"
            >
              {t("nav.forProfessionals")}
            </motion.h3>
            <div className="space-y-6">
              {professionalSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* For Clinics */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold text-foreground mb-8 text-center lg:text-start"
            >
              {t("nav.forClinics")}
            </motion.h3>
            <div className="space-y-6">
              {clinicSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
