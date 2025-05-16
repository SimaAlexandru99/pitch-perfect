"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-gradient-to-tr from-primary/20 via-indigo-300/10 to-sky-300/20 rounded-full blur-3xl opacity-40 animate-blob z-0" />
    <h2 className="relative z-10 text-3xl sm:text-5xl font-extrabold text-center mb-14 bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow">
      Industries Supported
    </h2>
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {industries.map(({ icon: Icon, title, description }) => (
        <Card
          key={title}
          className="bg-white/90 rounded-2xl shadow-xl border border-muted transition-transform hover:-translate-y-1 hover:shadow-2xl"
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
      <Card className="bg-gradient-to-br from-primary/10 to-sky-100/40 rounded-2xl border-2 border-dashed border-primary/40 p-0 flex flex-col items-center text-center justify-center min-h-[200px]">
        <CardHeader className="flex flex-col items-center text-center gap-2 pb-0">
          <CardContent className="flex flex-col items-center justify-center p-0 mb-2">
            <PlusCircle
              className="text-primary w-10 h-10 mb-3 animate-pulse"
              aria-label="More coming"
            />
          </CardContent>
          <CardTitle className="text-lg font-semibold mb-1">
            Extensible
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Add more industries dynamically from Firebase.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
    {/* Keyframes for blob animation */}
    <style jsx>{`
      @keyframes blob {
        0%,
        100% {
          transform: translate(-50%, 0) scale(1);
        }
        33% {
          transform: translate(-48%, 10px) scale(1.05, 0.97);
        }
        66% {
          transform: translate(-52%, -10px) scale(0.97, 1.05);
        }
      }
      .animate-blob {
        animation: blob 12s infinite linear;
      }
    `}</style>
  </section>
);

export default Industries;
