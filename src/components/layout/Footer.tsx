import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">SyndeoCare.ai</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.forProfessionals")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-professionals" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.findShifts")}
                </Link>
              </li>
              <li>
                <Link to="/signup?role=professional" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("common.signUp")}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.resources")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clinics */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.forClinics")}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-clinics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.postShifts")}
                </Link>
              </li>
              <li>
                <Link to="/signup?role=clinic" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("common.signUp")}
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.enterprise")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@syndeocare.ai
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                1-800-SYNDEO
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.terms")}
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.help")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
