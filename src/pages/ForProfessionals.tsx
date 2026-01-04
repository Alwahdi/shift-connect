import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Shield, 
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Heart
} from "lucide-react";

const ForProfessionals = () => {
  const benefits = [
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Choose shifts that work around your life. Work when you want, where you want."
    },
    {
      icon: DollarSign,
      title: "Competitive Pay",
      description: "Get paid fairly for your skills. Set your own rates and see transparent earnings."
    },
    {
      icon: MapPin,
      title: "Work Nearby",
      description: "Find shifts at facilities close to you. We match you based on your location preferences."
    },
    {
      icon: Shield,
      title: "Verified Facilities",
      description: "All clinics are verified and reviewed. Work with confidence at trusted healthcare facilities."
    },
    {
      icon: Clock,
      title: "Quick Payments",
      description: "Get paid fast. Our streamlined payment system ensures you receive your earnings promptly."
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Earn ratings and reviews from facilities. Build a profile that showcases your expertise."
    }
  ];

  const steps = [
    { number: "01", title: "Create Your Profile", description: "Sign up and add your qualifications, certifications, and availability." },
    { number: "02", title: "Get Verified", description: "Upload your documents for a quick verification process." },
    { number: "03", title: "Browse Shifts", description: "Find available shifts that match your skills and schedule." },
    { number: "04", title: "Start Working", description: "Accept shifts, show up, and get paid. It's that simple." }
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Users className="w-4 h-4" />
                For Healthcare Professionals
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                Your Career,{" "}
                <span className="text-primary">Your Terms</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Join thousands of healthcare professionals who've found flexible, 
                rewarding work through SyndeoCare. Pick your shifts, set your rates, 
                and take control of your career.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg">
                  <Link to="/auth?mode=signup&role=professional">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">
                    I Already Have an Account
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
                Why Professionals Choose SyndeoCare
              </h2>
              <p className="text-muted-foreground">
                We're building a platform that puts healthcare professionals first.
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
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary-foreground" />
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
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Getting started with SyndeoCare is quick and easy.
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
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Take Control of Your Career?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join SyndeoCare today and start finding shifts that fit your life.
              </p>
              <Button asChild size="lg">
                <Link to="/auth?mode=signup&role=professional">
                  Create Your Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
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

export default ForProfessionals;
