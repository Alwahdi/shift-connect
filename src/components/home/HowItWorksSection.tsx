import { motion } from "framer-motion";
import { UserPlus, FileCheck, Search, CalendarCheck } from "lucide-react";

const professionalSteps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description: "Sign up and tell us about your qualifications and experience.",
  },
  {
    icon: FileCheck,
    title: "Get Verified",
    description: "Upload your documents and we'll verify your credentials quickly.",
  },
  {
    icon: Search,
    title: "Browse Shifts",
    description: "Find opportunities that match your skills and schedule.",
  },
  {
    icon: CalendarCheck,
    title: "Start Working",
    description: "Accept shifts, check in, and get paid fast.",
  },
];

const clinicSteps = [
  {
    icon: UserPlus,
    title: "Register Clinic",
    description: "Create your organization account and set up your profile.",
  },
  {
    icon: FileCheck,
    title: "Configure Settings",
    description: "Set your booking preferences, rates, and requirements.",
  },
  {
    icon: Search,
    title: "Post Shifts",
    description: "Create shifts and our matching engine finds the best professionals.",
  },
  {
    icon: CalendarCheck,
    title: "Staff Your Facility",
    description: "Review matches, confirm bookings, and fill your schedule.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes, not days. Here's your journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Professionals */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold text-foreground mb-8 text-center lg:text-left"
            >
              For Professionals
            </motion.h3>
            <div className="space-y-6">
              {professionalSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* For Clinics */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold text-foreground mb-8 text-center lg:text-left"
            >
              For Clinics
            </motion.h3>
            <div className="space-y-6">
              {clinicSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
