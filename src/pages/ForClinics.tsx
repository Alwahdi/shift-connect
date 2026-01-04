import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Clock, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Zap,
  FileCheck,
  Star
} from "lucide-react";

const ForClinics = () => {
  const benefits = [
    {
      icon: Users,
      title: "Verified Professionals",
      description: "Access a pool of pre-verified healthcare professionals with confirmed credentials."
    },
    {
      icon: Zap,
      title: "Quick Fill Times",
      description: "Fill open shifts faster with our smart matching system and instant notifications."
    },
    {
      icon: FileCheck,
      title: "Simplified Compliance",
      description: "All credentials are verified and stored. Stay compliant without the paperwork."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Review ratings and history before booking. Ensure quality care for your patients."
    },
    {
      icon: Clock,
      title: "Reduce Admin Time",
      description: "Streamlined booking, check-ins, and payments. Less admin, more care."
    },
    {
      icon: TrendingUp,
      title: "Cost Effective",
      description: "No agency fees. Pay fair rates directly to professionals and save."
    }
  ];

  const steps = [
    { number: "01", title: "Register Your Facility", description: "Create your clinic profile and get verified." },
    { number: "02", title: "Post Your Shifts", description: "Add shifts with requirements, dates, and rates." },
    { number: "03", title: "Get Matched", description: "We'll match you with qualified, verified professionals." },
    { number: "04", title: "Staff & Manage", description: "Confirm bookings, track attendance, and rate performance." }
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
              >
                <Building2 className="w-4 h-4" />
                For Healthcare Facilities
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                Staff Your Facility{" "}
                <span className="text-accent">With Confidence</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Connect with verified healthcare professionals instantly. 
                Fill shifts quickly, ensure quality care, and reduce staffing headaches.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                  <Link to="/auth?mode=signup&role=clinic">
                    Register Your Facility
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
                Why Clinics Choose SyndeoCare
              </h2>
              <p className="text-muted-foreground">
                We make healthcare staffing simple, reliable, and cost-effective.
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
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-accent-foreground" />
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
                Start staffing your facility in minutes.
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
                  <div className="text-5xl font-bold text-accent/20 mb-4">{step.number}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Healthcare Facilities" },
                { value: "10K+", label: "Verified Professionals" },
                { value: "95%", label: "Fill Rate" },
                { value: "4.8★", label: "Average Rating" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-accent-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Simplify Your Staffing?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join SyndeoCare today and connect with verified healthcare professionals.
              </p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/auth?mode=signup&role=clinic">
                  Get Started Today
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

export default ForClinics;
