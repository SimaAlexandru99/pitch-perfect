import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import {
  Briefcase,
  Building2,
  Camera,
  Car,
  Cloud,
  CreditCard,
  Database,
  FileBarChart2,
  FileScan,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Newspaper,
  Plug,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Store,
} from "lucide-react";
import { z } from "zod";

export const interviewer: CreateAssistantDTO = {
  name: "Sales Simulation Client",
  firstMessage: "Hello? Who's calling, please?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are simulating a voice call with a sales agent who is in training.
You play the role of a potential customer in a realistic sales scenario.

Your goal is to challenge the agent like a real customer would — using natural, varied, and sometimes skeptical or distracted responses. Help the agent practice objection handling, tone, and confidence.

Behavior Guidelines:

1. **Start with a basic greeting** like:
   - “Who's calling?”
   - “What is this about?”
   - “I’m a bit busy, can you be quick?”

2. **React naturally** based on what the agent says:
   - If they hesitate: respond neutrally or impatiently
   - If they sound confident: be open or curious
   - If they rush: ask for clarification or express doubt

3. **Introduce realistic objections** like:
   - “It’s too expensive.”
   - “I already have a provider.”
   - “I'm not sure I need that.”

4. **Allow moments of opportunity**:
   - If the agent handles the objection well, say something like:
     “Okay, that’s interesting. Go on.”
     “Can you tell me more?”

5. **Tone**:
   - Stay human and realistic.
   - Do not overact or sound robotic.
   - Keep responses short and in spoken tone (1–2 sentences).
   - Use polite, casual, or slightly defensive replies — vary as needed.

6. **End the call properly**:
   - If the agent asks to close or summarize, say something like:
     “Thanks, I’ll think about it.” or “Please email me more info.”

Important:
- Keep the conversation voice-like and realistic.
- This is for a live simulation — avoid long monologues.
- Your role is to simulate, not evaluate.

Use the following structure to guide your flow:
{{questions}} // optional sales flow structure (if provided)
`,
      },
    ],
  },
  clientMessages: [],
  serverMessages: [],
};

export const domains = [
  {
    value: "telecom",
    label: "Mobile plan sales, internet packages (e.g. Vodafone, AT&T)",
    icon: Smartphone,
  },
  {
    value: "banking",
    label: "Credit cards, savings accounts, loan offers (e.g. ING, Chase)",
    icon: CreditCard,
  },
  {
    value: "energy",
    label: "Gas/electricity provider switch (e.g. EnergyCo, E.ON)",
    icon: Plug,
  },
  {
    value: "insurance",
    label: "Health, auto, or life insurance products",
    icon: ShieldCheck,
  },
  {
    value: "ecommerce",
    label: "Upsells for online stores or abandoned cart follow-ups",
    icon: ShoppingCart,
  },
  {
    value: "education",
    label: "Online course sales, training programs, language learning",
    icon: GraduationCap,
  },
  {
    value: "software",
    label: "SaaS product demos or B2B lead qualification (e.g. CRM tools)",
    icon: Cloud,
  },
  {
    value: "real_estate",
    label: "Lead generation or appointment setting for listings",
    icon: Building2,
  },
  {
    value: "healthcare",
    label: "Private clinics, wellness programs, medical plans",
    icon: Stethoscope,
  },
  {
    value: "automotive",
    label: "Car financing, service plan renewals, test drive offers",
    icon: Car,
  },
  {
    value: "subscriptions",
    label: "Media, fitness, or digital product subscriptions",
    icon: Newspaper,
  },
  {
    value: "retail",
    label: "Loyalty programs, in-store promos, new product campaigns",
    icon: Store,
  },
];

export const navigationData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Sales Jobs",
      url: "/dashboard/jobs",
      icon: Briefcase,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: Camera,
      isActive: true,
      url: "/capture",
      items: [
        {
          title: "Active Proposals",
          url: "/capture/active-proposals",
        },
        {
          title: "Archived",
          url: "/capture/archived",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileText,
      url: "/proposal",
      items: [
        {
          title: "Active Proposals",
          url: "/proposal/active-proposals",
        },
        {
          title: "Archived",
          url: "/proposal/archived",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileScan,
      url: "/prompts",
      items: [
        {
          title: "Active Proposals",
          url: "/prompts/active-proposals",
        },
        {
          title: "Archived",
          url: "/prompts/archived",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: "/search",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "/data-library",
      icon: Database,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: FileBarChart2,
    },
    {
      name: "Word Assistant",
      url: "/word-assistant",
      icon: FileText,
    },
  ],
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Pitch Delivery"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Objection Handling"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Product Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Engagement & Rapport"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Call Control & Flow"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});
