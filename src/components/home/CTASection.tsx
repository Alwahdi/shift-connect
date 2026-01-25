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
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] gradient-hero p-8 md:p-14 lg:p-20 text-center"
        >
          {/* Background decoration - Enhanced */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -end-32 w-72 md:w-96 h-72 md:h-96 bg-accent/25 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute -bottom-32 -start-32 w-80 md:w-[28rem] h-80 md:h-[28rem] bg-sky/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/8 rounded-full blur-[150px]" />
            {/* Floating decorative elements */}
            <div className="absolute top-1/4 start-1/6 w-4 h-4 bg-accent/40 rounded-full blur-sm animate-bounce" style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-1/3 end-1/5 w-3 h-3 bg-white/30 rounded-full blur-sm animate-bounce" style={{ animationDuration: '7s', animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-xl text-accent border border-white/25 mb-10 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">{t("common.getStarted")}</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-7 tracking-tight leading-tight">
              {t("home.cta.title")}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/80 mb-12 px-4 leading-relaxed">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  variant="accent"
                  className="w-full sm:w-auto shadow-2xl hover:shadow-glow-teal transition-all duration-300 min-w-[220px] border border-white/20"
                >
                  {t("home.cta.startFree")}
                  <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-md transition-all duration-300 min-w-[220px]"
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