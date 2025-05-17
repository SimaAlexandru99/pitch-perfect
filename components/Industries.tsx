"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Banknote,
  Flame,
  PhoneCall,
  PlusCircle,
  ShoppingCart,
  Smartphone,
} from "lucide-react";

const industries = [
  {
    icon: Smartphone,
    title: "Mobile Services",
    description: "Sell mobile plans, upgrades, and devices.",
  },
  {
    icon: Banknote,
    title: "Banking Products",
    description: "Promote credit cards, loans, and accounts.",
  },
  {
    icon: Flame,
    title: "Energy & Gas Providers",
    description: "Pitch energy, gas, and utility services.",
  },
  {
    icon: ShoppingCart,
    title: "Ecommerce Upsell",
    description: "Upsell products and services online.",
  },
  {
    icon: PhoneCall,
    title: "Cold Calling",
    description: "Master the art of outbound sales calls.",
  },
];

const Industries = () => (
  <section
    id="use-cases"
    className="relative w-full max-w-5xl mx-auto py-24 px-4 sm:px-8 overflow-hidden"
  >
    {/* Animated blurred background blob */}
    <motion.div
      className="absolute -top-24 left-1/2 w-[420px] h-[220px] bg-gradient-to-tr from-primary/20 via-indigo-300/10 to-sky-300/20 rounded-full blur-3xl opacity-40 z-0"
      initial={{ y: 0, scaleX: 1, scaleY: 1 }}
      animate={{
        y: [0, 10, -10, 0],
        scaleX: [1, 1.05, 0.97, 1],
        scaleY: [1, 0.97, 1.05, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        times: [0, 0.33, 0.66, 1],
      }}
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    />
    <h2 className="relative z-10 text-3xl sm:text-5xl font-extrabold text-center mb-14 bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow">
      Industries Supported
    </h2>
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {industries.map(({ icon: Icon, title, description }) => (
        <Card
          key={title}
          className="bg-card/90 rounded-2xl shadow-xl border border-border transition-transform hover:-translate-y-1 hover:shadow-2xl"
        >
          <CardHeader className="flex flex-col items-center text-center gap-2 pb-0">
            <CardContent className="flex flex-col items-center justify-center p-0 mb-2">
              <Icon
                className="text-primary w-12 h-12 mb-2 animate-pulse"
                aria-label={title}
              />
            </CardContent>
            <CardTitle className="text-xl font-semibold mb-1">
              {title}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
      {/* Extensible card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-dashed border-primary/20 shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl">
        <CardHeader className="flex flex-col items-center text-center gap-2 pb-0">
          <CardContent className="flex flex-col items-center justify-center p-0 mb-2">
            <PlusCircle
              className="text-primary w-12 h-12 mb-2 animate-pulse"
              aria-label="More coming"
            />
          </CardContent>
          <CardTitle className="text-xl font-semibold mb-1">
            Extensible
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Add more industries dynamically from Firebase.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </section>
);

export default Industries;
