import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "@/config/constants";
import syndeoCareLogoWhite from "@/assets/syndeocare-logo-white.png";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="gradient-hero text-white">
      <div className="container mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={syndeoCareLogoWhite} 
                alt="SyndeoCare Logo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-white/70 leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-white text-lg mb-5">{t("footer.forProfessionals")}</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/for-professionals" className="text-white/70 hover:text-accent transition-colors">
                  {t("footer.findShifts")}
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=professional" className="text-white/70 hover:text-accent transition-colors">
                  {t("common.signUp")}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/70 hover:text-accent transition-colors">
                  {t("footer.resources")}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clinics */}
          <div>
            <h4 className="font-semibold text-white text-lg mb-5">{t("footer.forClinics")}</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/for-clinics" className="text-white/70 hover:text-accent transition-colors">
                  {t("footer.postShifts")}
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=clinic" className="text-white/70 hover:text-accent transition-colors">
                  {t("common.signUp")}
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="text-white/70 hover:text-accent transition-colors">
                  {t("footer.enterprise")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-lg mb-5">{t("footer.contact")}</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0 text-accent" />
                {SITE_CONFIG.supportEmail}
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 flex-shrink-0 text-accent" />
                {SITE_CONFIG.supportPhone}
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <MapPin className="w-5 h-5 flex-shrink-0 text-accent" />
                {SITE_CONFIG.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-sm text-white/50">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6 md:gap-8">
            <Link to="/privacy" className="text-sm text-white/50 hover:text-accent transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="text-sm text-white/50 hover:text-accent transition-colors">
              {t("footer.terms")}
            </Link>
            <Link to="/help" className="text-sm text-white/50 hover:text-accent transition-colors">
              {t("footer.help")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
