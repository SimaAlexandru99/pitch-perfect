import { ModeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

const Footer = () => (
  <footer className="w-full border-t border-border py-4 px-6 text-center text-xs text-muted-foreground mt-12 flex flex-col items-center gap-2">
    <div className="flex gap-4 mb-1">
      <Link
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        GitHub
      </Link>
      <Link
        href="https://demo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        Demo
      </Link>
    </div>
    <div>© 2025 PitchPerfect AI. Built for Vapi Build Challenge 2025.</div>
    <ModeToggle />
  </footer>
);

export default Footer;
