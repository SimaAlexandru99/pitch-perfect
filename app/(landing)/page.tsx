import FeaturesSection from "@/components/features-six";
import HeroSection from "@/components/hero-section-one";
import Integrations from "@/components/integrations-three";

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection />
      <FeaturesSection />
      <Integrations />
    </div>
  );
}
