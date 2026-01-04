import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

interface StatsGridProps {
  stats: Stat[];
  variant?: "primary" | "accent";
}

const StatsGrid = ({ stats, variant = "primary" }: StatsGridProps) => {
  const colorClass = variant === "accent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {stat.trend && (
                <p className={`text-xs ${stat.trend.positive ? "text-success" : "text-destructive"}`}>
                  {stat.trend.positive ? "↑" : "↓"} {stat.trend.value}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsGrid;
