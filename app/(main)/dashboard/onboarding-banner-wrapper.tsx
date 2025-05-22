"use client";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const OnboardingBanner = dynamic(() => import("./onboarding-banner"), {
  ssr: false,
});

export default function OnboardingBannerWrapper() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-4">
          <Loader2 className="animate-spin size-6 text-white/80" />
        </div>
      }
    >
      <OnboardingBanner />
    </Suspense>
  );
}
