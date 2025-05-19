"use client";
import {Button} from "@/components/ui/button";
import {ArrowRight, Mic} from "lucide-react";
import Link from "next/link";

const Hero = () => (
    <section
        id="hero"
        className="relative flex flex-col items-center justify-center min-h-[70vh] py-24 text-center overflow-hidden bg-gradient-to-b from-background to-muted/20"
    >
        {/* Animated blurred background blob */}
        <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[320px] bg-gradient-to-tr from-primary/20 via-indigo-300/10 to-sky-300/10 rounded-full blur-3xl opacity-40 animate-blob z-0"/>
        {/* Tagline */}
        <span className="relative z-10 mb-4 text-base sm:text-lg font-medium text-primary/80 tracking-wide uppercase">
      AI-powered sales call training
    </span>
        {/* Main Title */}
        <div className="relative z-10 flex flex-col items-center gap-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight flex items-center gap-3">
                <Mic
                    className="inline-block text-primary w-12 h-12 animate-pulse drop-shadow-lg"
                    aria-label="microphone"
                />
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
          PitchPerfect AI
        </span>
            </h1>
            <p className="text-lg sm:text-2xl text-muted-foreground max-w-2xl mt-2">
                Train your sales voice. Pitch like a pro.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap justify-center">
                <Button asChild size="lg" className="px-8 py-4 text-lg shadow-lg">
                    <Link
                        href="/dashboard"
                        scroll={true}
                        className="flex items-center gap-2"
                    >
                        Start Training <ArrowRight className="w-5 h-5"/>
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg"
                >
                    <Link href="#" scroll={true}>
                        View Demo
                    </Link>
                </Button>
            </div>
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

export default Hero;
