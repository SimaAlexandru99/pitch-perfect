import { ModeToggle } from "@/components/ThemeToggle";

const Footer = () => (
  <footer className="w-full border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500 mt-12 flex flex-col items-center gap-2">
    <div className="flex gap-4 mb-1">
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        GitHub
      </a>
      <a
        href="https://demo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        Demo
      </a>
    </div>
    <div>© 2025 PitchPerfect AI. Built for Vapi Build Challenge 2025.</div>
    <ModeToggle />
  </footer>
);

export default Footer;
