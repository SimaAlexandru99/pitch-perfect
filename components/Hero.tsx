"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CirclePlay } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const trustedLogos = [
  {
    src: "https://html.tailus.io/blocks/customers/column.svg",
    alt: "Column Logo",
    height: 16,
    width: 72,
  },
  {
    src: "https://html.tailus.io/blocks/customers/nvidia.svg",
    alt: "Nvidia Logo",
    height: 20,
    width: 72,
  },
  {
    src: "https://html.tailus.io/blocks/customers/github.svg",
    alt: "GitHub Logo",
    height: 16,
    width: 72,
  },
];

const Hero = () => (
  <main className="overflow-hidden">
    <section className="bg-gradient-to-b from-background to-muted/20">
      <div className="relative py-24 md:py-36">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 flex flex-col md:flex-row items-center gap-16">
          {/* Left: Text & Actions */}
          <div className="w-full md:w-1/2 flex flex-col items-start">
            <h1 className="max-w-md text-balance text-4xl font-extrabold md:text-6xl tracking-tight">
              AI-powered sales call training
            </h1>
            <p className="text-muted-foreground my-8 max-w-2xl text-balance text-lg md:text-xl">
              Train your sales voice. Pitch like a pro. One tool for practice,
              feedback, and improvement—right inside PitchPerfect AI.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button asChild size="lg" className="pr-4.5">
                <Link href="/dashboard">
                  <span className="text-nowrap">Start Training</span>
                  <ArrowRight className="opacity-50 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="pl-5">
                <Link href="#demo">
                  <CirclePlay className="fill-primary/25 stroke-primary mr-2" />
                  <span className="text-nowrap">Watch Demo</span>
                </Link>
              </Button>
            </div>
            <div className="mt-10">
              <p className="text-muted-foreground text-sm">
                Trusted by teams at:
              </p>
              <div className="mt-6 grid max-w-xs grid-cols-3 gap-6">
                {trustedLogos.map((logo) => (
                  <div className="flex items-center" key={logo.alt}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      height={logo.height}
                      width={logo.width}
                      className="h-4 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right: Product Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative before:border-foreground/5 before:bg-foreground/5 before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
              <div className="bg-background rounded-2xl shadow-foreground/10 ring-foreground/5 relative h-full -translate-y-8 skew-x-6 overflow-hidden border border-transparent shadow-md ring-1">
                <Image
                  src="/tailark.png"
                  alt="PitchPerfect AI app screenshot"
                  width={720}
                  height={480}
                  className="object-top-left w-full h-auto object-cover min-h-[240px]"
                  priority
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default Hero;
