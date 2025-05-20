import { Mona_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "PitchPerfect – AI-Powered Voice Sales Training Platform",
  description:
    "Master sales conversations with realistic AI voice simulations. Practice, get instant feedback, and improve your pitch for any industry or scenario. Elevate your sales skills with PitchPerfect.",
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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
