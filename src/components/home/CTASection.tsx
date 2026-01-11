import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl md:rounded-[2rem] gradient-hero p-8 md:p-14 lg:p-20 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -end-24 w-64 md:w-80 h-64 md:h-80 bg-accent/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -start-24 w-80 md:w-96 h-80 md:h-96 bg-sky/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-accent border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">{t("common.getStarted")}</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              {t("home.cta.title")}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/75 mb-10 px-4 leading-relaxed">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  variant="accent"
                  className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[200px]"
                >
                  {t("home.cta.startFree")}
                  <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white hover:text-primary bg-white/5 backdrop-blur-sm transition-all duration-300 min-w-[200px]"
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