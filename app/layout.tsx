import { Mona_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "PitchPerfect AI – Voice-Based Sales Training Simulator",
  description:
    "Practice real sales calls across industries with AI-powered voice simulations. Handle objections, perfect your pitch, and get instant feedback — all in one interactive training platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${monaSans.className} antialiased pattern`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
