import {
  Gemini,
  GooglePaLM,
  MagicUI,
  MediaWiki,
  Replit,
  VSCodium,
} from "@/components/logos";
import { Card } from "@/components/ui/card";
import * as React from "react";

export default function Integrations() {
  return (
    <section>
      <div className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div>
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              Connect PitchPerfect with your sales stack
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Seamlessly integrate with leading CRM, analytics, and productivity
              tools to supercharge your sales training and performance.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <IntegrationCard
              title="Google Gemini"
              description="Leverage advanced AI for realistic voice simulations and instant feedback."
            >
              <Gemini />
            </IntegrationCard>

            <IntegrationCard
              title="Replit"
              description="Collaborate and practice sales scripts in real time with your team."
            >
              <Replit />
            </IntegrationCard>

            <IntegrationCard
              title="Magic UI"
              description="Enhance your training experience with interactive, user-friendly interfaces."
            >
              <MagicUI />
            </IntegrationCard>

            <IntegrationCard
              title="VSCodium"
              description="Integrate with your workflow for seamless script editing and version control."
            >
              <VSCodium />
            </IntegrationCard>

            <IntegrationCard
              title="MediaWiki"
              description="Access and contribute to a knowledge base of sales best practices and objection handling."
            >
              <MediaWiki />
            </IntegrationCard>

            <IntegrationCard
              title="Google PaLM"
              description="Power your training with state-of-the-art language models for dynamic conversations."
            >
              <GooglePaLM />
            </IntegrationCard>
          </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Card variant="soft" className="p-6">
      <div className="relative">
        <div className="*:size-10">{children}</div>

        <div className="mt-6 space-y-1.5">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
    </Card>
  );
};
