"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {motion} from "framer-motion";
import {BarChart2, Bot, MessageCircle, User2, Zap} from "lucide-react";

const steps = [
    {
        icon: (
            <User2
                className="text-primary w-12 h-12 mb-2 animate-pulse"
                aria-label="Choose your sales role"
            />
        ),
        title: "Choose your sales role",
        description: "Mobile, Banking, Energy, Ecommerce, and more.",
    },
    {
        icon: (
            <Bot
                className="text-primary w-12 h-12 mb-2 animate-pulse"
                aria-label="Mock call with AI client"
            />
        ),
        title: "Mock call with AI client",
        description: "Simulate real conversations with a lifelike AI.",
    },
    {
        icon: (
            <MessageCircle
                className="text-primary w-12 h-12 mb-2 animate-pulse"
                aria-label="Handle objections"
            />
        ),
        title: "Handle objections",
        description: "Practice tricky responses and real-world objections.",
    },
    {
        icon: (
            <Zap
                className="text-primary w-12 h-12 mb-2 animate-pulse"
                aria-label="Instant feedback"
            />
        ),
        title: "Instant feedback",
        description: "Get actionable insights powered by Gemini AI.",
    },
    {
        icon: (
            <BarChart2
                className="text-primary w-12 h-12 mb-2 animate-pulse"
                aria-label="Review & improve"
            />
        ),
        title: "Review & improve",
        description: "Track your progress and refine your pitch over time.",
    },
];

const HowItWorks = () => (
    <section
        id="how-it-works"
        className="relative w-full max-w-5xl mx-auto py-24 px-4 sm:px-8 overflow-hidden"
    >
        {/* Animated blurred background blob */}
        <motion.div
            className="absolute -top-24 left-1/2 w-[420px] h-[220px] bg-gradient-to-tr from-primary/20 via-indigo-300/10 to-sky-300/20 rounded-full blur-3xl opacity-50 z-0"
            initial={{y: 0, scaleX: 1, scaleY: 1}}
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
            How It Works
        </h2>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {steps.map((step) => (
                <Card
                    key={step.title}
                    className="bg-card/90 rounded-2xl shadow-xl border border-border transition-transform hover:-translate-y-1 hover:shadow-2xl"
                >
                    <CardHeader className="flex flex-col items-center text-center gap-2 pb-0">
                        <CardContent className="flex flex-col items-center justify-center p-0 mb-2">
                            {step.icon}
                        </CardContent>
                        <CardTitle className="text-xl font-semibold mb-1">
                            {step.title}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            {step.description}
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    </section>
);

export default HowItWorks;
