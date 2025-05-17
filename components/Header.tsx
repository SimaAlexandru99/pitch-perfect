import { ModeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isAuthenticated } from "@/lib/actions/auth.action";
import Link from "next/link";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
];

const Header = async () => {
  const isUserAuthenticated = await isAuthenticated();

  return (
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border py-3 px-6 flex items-center justify-between">
      <Link
        href="#"
        className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        scroll={true}
      >
        PitchPerfect <span className="text-primary">AI</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    className="text-sm font-medium hover:text-primary transition-colors"
                    scroll={true}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          {isUserAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </nav>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 max-w-xs w-full">
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <div className="flex items-center gap-2 px-6 pt-6 pb-2">
              <span className="font-bold text-lg tracking-tight">
                PitchPerfect <span className="text-primary">AI</span>
              </span>
            </div>
            <nav className="flex flex-col gap-2 px-4 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors shadow-sm"
                  scroll={true}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-row items-center gap-2 px-4">
              {isUserAuthenticated ? (
                <Button asChild size="lg" className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="lg" className="w-1/2">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild variant="default" size="lg" className="w-1/2">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <ModeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
