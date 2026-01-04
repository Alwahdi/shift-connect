import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  MapPin, 
  Calendar, 
  Star, 
  CreditCard,
  Clock,
  FileCheck
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description: "All credentials, licenses, and certifications verified before matching.",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Smart algorithm matches the right professionals to your shifts in seconds.",
  },
  {
    icon: MapPin,
    title: "Location-Based",
    description: "Find nearby opportunities or staff within your preferred radius.",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Set your availability and book shifts that fit your life.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Build your reputation with transparent feedback from both sides.",
  },
  {
    icon: CreditCard,
    title: "Fast Payments",
    description: "Get paid quickly with transparent rates and no surprises.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Instant notifications for new opportunities and booking confirmations.",
  },
  {
    icon: FileCheck,
    title: "Easy Documentation",
    description: "Upload and manage all your documents in one secure place.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for the modern healthcare workforce. Simple, secure, and efficient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
