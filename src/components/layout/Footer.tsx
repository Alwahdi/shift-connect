import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-bold text-xl text-primary-foreground">SyndeoCare</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">{t("footer.forProfessionals")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-professionals" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {t("footer.findShifts")}
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=professional" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {t("common.signUp")}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {t("footer.resources")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clinics */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">{t("footer.forClinics")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-clinics" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {t("footer.postShifts")}
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=clinic" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {t("common.signUp")}
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {t("footer.enterprise")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 flex-shrink-0 text-accent" />
                support@syndeocare.ai
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 flex-shrink-0 text-accent" />
                1-800-SYNDEO
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 flex-shrink-0 text-accent" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
              {t("footer.terms")}
            </Link>
            <Link to="/help" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
              {t("footer.help")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
