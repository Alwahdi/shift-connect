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
    <section className="py-20 md:py-28 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            {t("home.howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* For Professionals */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl font-bold text-foreground mb-10 text-center lg:text-start"
            >
              {t("nav.forProfessionals")}
            </motion.h3>
            <div className="space-y-8">
              {professionalSteps.map((step, index) => (
                <motion.div
                  key={step.title + index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-5"
                >
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h4 className="font-semibold text-foreground text-lg mb-2">{step.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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
              className="text-xl md:text-2xl font-bold text-foreground mb-10 text-center lg:text-start"
            >
              {t("nav.forClinics")}
            </motion.h3>
            <div className="space-y-8">
              {clinicSteps.map((step, index) => (
                <motion.div
                  key={step.title + index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-5"
                >
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-accent flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h4 className="font-semibold text-foreground text-lg mb-2">{step.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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