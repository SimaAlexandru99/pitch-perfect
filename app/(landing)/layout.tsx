import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ReactNode } from "react";

const LandingLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
