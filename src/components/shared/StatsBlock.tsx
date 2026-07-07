import { useCountUp } from "@/hooks/useCountUp";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Shield, TrendingUp, Users2 } from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
  {
    id: "clients",
    icon: Users2,
    end: 500,
    suffix: "+",
    label: "Happy Clients",
    description: "Satisfied investors across India",
  },
  {
    id: "aum",
    icon: TrendingUp,
    end: 12,
    prefix: "₹",
    suffix: "Cr+",
    label: "Assets Under Management",
    description: "Growing portfolio value",
  },
  {
    id: "returns",
    icon: Award,
    end: 12,
    suffix: "%+",
    label: "Average Returns",
    description: "Consistent performance track record",
  },
  {
    id: "research",
    icon: Shield,
    end: 100,
    suffix: "%",
    label: "Research Based",
    description: "Data-driven investment decisions",
  },
];

interface StatsBlockProps {
  variant?: "compact" | "cards";
  className?: string;
}

export function StatsBlock({ variant = "cards", className = "" }: StatsBlockProps) {
  const counters = STATS.map((stat, index) =>
    useCountUp({
      end: stat.end,
      prefix: stat.prefix || "",
      suffix: stat.suffix || "",
      duration: 800,
      delay: index * 100,
    })
  );

  if (variant === "compact") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 ${className}`}>
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
          >
            <div
              ref={counters[index].ref}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-financial-accent"
            >
              {counters[index].value}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 ${className}`}>
      {STATS.map((stat, index) => (
        <Card
          key={stat.id}
          className="bg-gradient-card border-0 shadow-card hover:shadow-financial transition-all duration-300 hover:-translate-y-2"
        >
          <CardContent className="p-6 sm:p-8 text-center">
            <stat.icon className="w-8 h-8 text-financial-accent mx-auto mb-4" />
            <div
              ref={counters[index].ref}
              className="text-2xl sm:text-3xl font-bold text-financial-accent mb-2"
            >
              {counters[index].value}
            </div>
            <div className="text-sm sm:text-base font-medium text-foreground mb-2">
              {stat.label}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {stat.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
