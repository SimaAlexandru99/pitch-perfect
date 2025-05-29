import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, LifeBuoy, BookOpen } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="relative flex flex-col items-center justify-center mb-10 py-12 px-6 rounded-3xl bg-gradient-to-br from-yellow-50 via-primary-50 to-white shadow-xl overflow-hidden border-0">
        <LifeBuoy className="absolute opacity-10 w-48 h-48 -top-12 -right-12 text-primary pointer-events-none" />
        <h1 className="text-4xl font-extrabold text-primary mb-2 z-10">
          Help & Support
        </h1>
        <p className="text-lg text-muted-foreground mb-2 text-center z-10 max-w-xl">
          Welcome to PitchPerfect AI! Here you can find answers to common
          questions, tips for getting started, and ways to contact support.
        </p>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Frequently Asked
          Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="faq-1">
            <AccordionTrigger>
              How do I start a Daily Pitch Challenge?
            </AccordionTrigger>
            <AccordionContent>
              Go to your dashboard and click the &quot;Start Challenge&quot;
              button in the Daily Pitch Challenge card. Follow the prompts to
              complete the challenge.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>
              How do I track my progress and streaks?
            </AccordionTrigger>
            <AccordionContent>
              Your dashboard displays your current streak, global rank, and top
              domains. Completing daily challenges and games will help you
              maintain your streak and improve your stats.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger>
              Can I redo a Daily Pitch Challenge?
            </AccordionTrigger>
            <AccordionContent>
              Each Daily Pitch Challenge can only be completed once per day.
              Come back tomorrow for a new challenge!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-4">
            <AccordionTrigger>How do I contact support?</AccordionTrigger>
            <AccordionContent>
              Use the contact section below or email us at{" "}
              <a
                href="mailto:support@pitchperfect.ai"
                className="text-primary underline"
              >
                support@pitchperfect.ai
              </a>
              .
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" /> Contact & Support
        </h2>
        <p className="mb-4 text-muted-foreground">
          Need more help? Reach out to our support team and we&apos;ll get back
          to you as soon as possible.
        </p>
        <Link href="mailto:support@pitchperfect.ai">
          <Button variant="default" className="font-semibold">
            Email Support
          </Button>
        </Link>
      </Card>
    </div>
  );
}
