import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
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
              <span className="font-bold text-xl text-foreground">SyndeoCare</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connecting healthcare professionals with clinics. 
              Building a healthier workforce, one shift at a time.
            </p>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Professionals</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-professionals" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Shifts
                </Link>
              </li>
              <li>
                <Link to="/signup?role=professional" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clinics */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Clinics</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/for-clinics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Post Shifts
                </Link>
              </li>
              <li>
                <Link to="/signup?role=clinic" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                support@syndeocare.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                1-800-SYNDEO
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SyndeoCare. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
