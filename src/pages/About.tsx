import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Users, 
  Building2, 
  Shield, 
  Target,
  Sparkles,
  ArrowRight
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Care First",
      description: "We believe in putting healthcare professionals and patients at the center of everything we do."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Rigorous verification ensures every professional is qualified and every facility is legitimate."
    },
    {
      icon: Sparkles,
      title: "Simplicity",
      description: "We make complex healthcare staffing simple with intuitive tools and transparent processes."
    },
    {
      icon: Target,
      title: "Reliability",
      description: "When you need staff, we deliver. Our platform is built for dependable, consistent results."
    }
  ];

  const team = [
    { name: "Healthcare Professionals", count: "10,000+", description: "Verified nurses and healthcare workers" },
    { name: "Healthcare Facilities", count: "500+", description: "Clinics, hospitals, and care centers" },
    { name: "Shifts Filled", count: "50,000+", description: "Successful staffing placements" },
    { name: "Cities", count: "100+", description: "Locations across the country" }
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
                className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6"
              >
                <Heart className="w-8 h-8 text-primary-foreground" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              >
                About SyndeoCare
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground"
              >
                We're on a mission to transform healthcare staffing by connecting 
                verified professionals with facilities that need them.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                  <p className="text-muted-foreground mb-4">
                    SyndeoCare was founded with a simple belief: healthcare staffing shouldn't be complicated. 
                    Too often, qualified professionals struggle to find flexible work, while facilities 
                    scramble to fill critical shifts.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    We're changing that by building a platform that puts both sides in control. 
                    Professionals can find shifts that fit their lives, and facilities can quickly 
                    connect with verified, qualified staff.
                  </p>
                  <p className="text-muted-foreground">
                    Our technology handles the complexity—verification, matching, scheduling, payments—so 
                    everyone can focus on what matters most: delivering quality care.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <Users className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold text-foreground mb-1">For Professionals</h4>
                    <p className="text-sm text-muted-foreground">Flexible work on your terms</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                    <Building2 className="w-8 h-8 text-accent mb-3" />
                    <h4 className="font-semibold text-foreground mb-1">For Facilities</h4>
                    <p className="text-sm text-muted-foreground">Reliable staffing solutions</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-success/5 border border-success/10 col-span-2">
                    <Heart className="w-8 h-8 text-success mb-3" />
                    <h4 className="font-semibold text-foreground mb-1">For Patients</h4>
                    <p className="text-sm text-muted-foreground">Better care through better staffing</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                These principles guide everything we do at SyndeoCare.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border text-center"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">By the Numbers</h2>
              <p className="text-muted-foreground">
                Growing together with healthcare communities across the country.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-background border border-border"
                >
                  <div className="text-3xl font-bold text-primary mb-2">{stat.count}</div>
                  <h4 className="font-semibold text-foreground mb-1">{stat.name}</h4>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Join the SyndeoCare Community
              </h2>
              <p className="text-muted-foreground mb-8">
                Whether you're a healthcare professional looking for flexible work or a 
                facility needing reliable staff, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/for-professionals">
                    I'm a Professional
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/for-clinics">
                    I'm a Facility
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
