import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl gradient-hero p-8 md:p-12 lg:p-16 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -end-20 w-48 md:w-64 h-48 md:h-64 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -start-20 w-64 md:w-80 h-64 md:h-80 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t("common.getStarted")}</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-8 px-4">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  variant="accent"
                  className="w-full sm:w-auto"
                >
                  {t("home.cta.startFree")}
                  <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {t("nav.about")}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
