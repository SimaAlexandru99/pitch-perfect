import { createSalesPrompt } from "@/lib/prompt-templates";
import {
  Briefcase,
  Building2,
  Camera,
  Car,
  Cloud,
  CreditCard,
  FileScan,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
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
  Trophy,
} from "lucide-react";
import { z } from "zod";

import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const interviewer: CreateAssistantDTO = {
  name: "Sales Simulation Client",
  firstMessage:
    "Hello? I'm a potential customer interested in {{jobTitle}} in the {{jobDomain}} sector. I understand this is a {{jobLevel}} level position. When you're ready, please introduce yourself and your company.",
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

Job Context:
{{jobContext}}

// Persona-specific behavioral guidelines will be injected here:
{{personaInstructions}}

Behavior Guidelines:

1. **Start with a basic greeting** like:
   - "Who's calling?"
   - "What is this about?"
   - "I'm a bit busy, can you be quick?"

2. **React naturally** based on what the agent says:
   - If they hesitate: respond neutrally or impatiently
   - If they sound confident: be open or curious
   - If they rush: ask for clarification or express doubt

3. **Introduce realistic objections** like:
   - "It's too expensive."
   - "I already have a provider."
   - "I'm not sure I need that."

4. **Allow moments of opportunity**:
   - If the agent handles the objection well, say something like:
     "Okay, that's interesting. Go on."
     "Can you tell me more?"

5. **Tone**:
   - Stay human and realistic.
   - Do not overact or sound robotic.
   - Keep responses short and in spoken tone (1–2 sentences).
   - Use polite, casual, or slightly defensive replies — vary as needed.

6. **End the call properly**:
   - If the agent asks to close or summarize, say something like:
     "Thanks, I'll think about it." or "Please email me more info."

Important:
- Keep the conversation voice-like and realistic.
- This is for a live simulation — avoid long monologues.
- Your role is to simulate, not evaluate.
- Use the job context provided to make your responses relevant to the specific role and domain.

Use the following structure to guide your flow:
{{questions}} // optional sales flow structure (if provided)
{{personaInstructions}}
`,
      },
    ],
    tools: [
      {
        type: "endCall",
      },
    ],
  },
};

interface BaseGameMode {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  iconName: "Trophy" | "Flame" | "Timer" | "User" | "Mic";
}

interface RPGGameMode extends BaseGameMode {
  type: "rpg";
  maxLevel: number;
}

interface StreakGameMode extends BaseGameMode {
  type: "streak";
  streakGoal: number;
}

interface TimeAttackGameMode extends BaseGameMode {
  type: "timeAttack";
  timeLimit: number;
}

interface MysteryGameMode extends BaseGameMode {
  type: "mystery";
}

interface VoiceOlympicsGameMode extends BaseGameMode {
  type: "voiceOlympics";
}

type GameMode =
  | RPGGameMode
  | StreakGameMode
  | TimeAttackGameMode
  | MysteryGameMode
  | VoiceOlympicsGameMode;

export const gameModes: GameMode[] = [
  {
    id: "rpg",
    name: "Sales Quest: The RPG Game",
    description: "Level up your sales skills through an epic adventure",
    type: "rpg",
    difficulty: "medium",
    maxLevel: 3,
    iconName: "Trophy",
  },
  {
    id: "streak",
    name: "Streak Mode",
    description: "Maintain a perfect response streak to win",
    type: "streak",
    difficulty: "hard",
    streakGoal: 10,
    iconName: "Flame",
  },
  {
    id: "timeAttack",
    name: "Time Attack – Speed Selling",
    description: "Make your pitch under time pressure",
    type: "timeAttack",
    difficulty: "medium",
    timeLimit: 60,
    iconName: "Timer",
  },
  {
    id: "mystery",
    name: "Mystery Persona Match",
    description: "Figure out the customer persona through conversation",
    type: "mystery",
    difficulty: "easy",
    iconName: "User",
  },
  {
    id: "voiceOlympics",
    name: "Voice Olympics",
    description: "Master your vocal delivery and presentation",
    type: "voiceOlympics",
    difficulty: "medium",
    iconName: "Mic",
  },
];

export const gameAssistant: CreateAssistantDTO = {
  name: "Sales Game AI",
  firstMessage:
    "Welcome to the sales practice game! I'll be your AI coach. Let's begin!",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
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
        content: `You are a sales training AI playing the role of a customer in a game mode.
Your goal is to help the user improve their sales skills through this interactive game.

Game Mode: {{gameMode}}
Current Level: {{currentLevel}}
User Name: {{userName}}

Guidelines:
1. Stay in character based on the game mode
2. Provide appropriate challenges based on the level
3. Give clear feedback on performance
4. Maintain game mechanics (time limits, streak counting, etc.)

{{modeSpecificPrompt}}`,
      },
    ],
    tools: [
      {
        type: "endCall",
      },
    ],
  },
};

export const domains = [
  {
    value: "telecom",
    label: "Mobile plan sales, internet packages (e.g. Vodafone, AT&T)",
    icon: Smartphone,
    prompt: createSalesPrompt({
      industry: "telecom",
      intro:
        "A friendly and professional introduction that establishes credibility in the telecom industry.",
      pitch: `A compelling pitch for a telecom plan that includes:\n   - Create a catchy plan name with a partner (e.g., \"RED with Disney+\", \"BLUE with Netflix\", \"GOLD with HBO Max\")\n   - Format the plan name with HTML tags: [PLAN_NAME] <strong>with</strong> [PARTNER]\n   - List key features in this exact format:\n     * Partner benefit (e.g., \"Disney+ subscription included\")\n     * Data: \"UNLIMITED 5G Internet\"\n     * Voice/SMS: \"UNLIMITED minutes and SMS in any national network\"\n     * International: \"[X] international minutes\"\n     * Roaming: \"[X] GB in [REGION] roaming\"\n     * Technology: \"5G Ready\"\n   - Pricing: Always specify prices in EUR (€)\n   - Contract Options: Offer 6, 12, or 24-month contracts with different pricing tiers\n   - Add any special features or add-ons`,
      objections: [
        "Price concerns (always reference EUR pricing)",
        "Contract duration (emphasize flexibility of 6/12/24 month options)",
        "Network coverage",
        "Current provider loyalty",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "banking",
    label: "Credit cards, savings accounts, loan offers (e.g. ING, Chase)",
    icon: CreditCard,
    prompt: createSalesPrompt({
      industry: "banking",
      intro:
        "A friendly and professional introduction that establishes credibility in banking.",
      pitch: `A compelling pitch for a financial product that includes:\n   - Product name and type (e.g., \"Premium Credit Card\")\n   - Key benefits and features\n   - Interest rates and fees (always in EUR)\n   - Rewards program details\n   - Special promotions or introductory offers (in EUR)\n   - Contract Options: 6, 12, or 24-month terms with different benefits`,
      objections: [
        "Credit score concerns",
        "Existing banking relationships",
        "Fee structure (always reference EUR)",
        "Application process",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "energy",
    label: "Gas/electricity provider switch (e.g. EnergyCo, E.ON)",
    icon: Plug,
    prompt: createSalesPrompt({
      industry: "energy",
      intro:
        "A friendly and professional introduction that establishes credibility in energy services.",
      pitch: `A compelling pitch for an energy plan that includes:\n   - Plan name and type (e.g., \"Green Energy Plus\")\n   - Energy source details\n   - Rate structure and savings (always in EUR)\n   - Contract Options: 6, 12, or 24-month terms with different rates\n   - Green energy benefits`,
      objections: [
        "Current contract terms",
        "Price stability concerns (reference EUR pricing)",
        "Switching process",
        "Service reliability",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "insurance",
    label: "Health, auto, or life insurance products",
    icon: ShieldCheck,
    prompt: createSalesPrompt({
      industry: "insurance",
      intro:
        "A friendly and professional introduction that establishes credibility in insurance.",
      pitch: `A compelling pitch for an insurance plan that includes:\n   - Plan name and coverage type\n   - Coverage details and limits\n   - Premium structure (always in EUR)\n   - Special features or riders\n   - Claims process\n   - Contract Options: 6, 12, or 24-month terms with different premium rates`,
      objections: [
        "Premium costs (reference EUR pricing)",
        "Existing coverage",
        "Claims history",
        "Policy complexity",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "ecommerce",
    label: "Upsells for online stores or abandoned cart follow-ups",
    icon: ShoppingCart,
    prompt: createSalesPrompt({
      industry: "ecommerce",
      intro:
        "A friendly and professional introduction that establishes credibility in e-commerce.",
      pitch: `A compelling pitch for products that includes:\n   - Product name and category\n   - Key features and benefits\n   - Special offers or discounts (always in EUR)\n   - Shipping and return policy\n   - Customer reviews or ratings\n   - Payment Options: 6, 12, or 24-month installment plans (in EUR)`,
      objections: [
        "Price concerns (reference EUR pricing)",
        "Product quality",
        "Shipping time",
        "Return policy",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "education",
    label: "Online course sales, training programs, language learning",
    icon: GraduationCap,
    prompt: createSalesPrompt({
      industry: "education",
      intro:
        "A friendly and professional introduction that establishes credibility in education.",
      pitch: `A compelling pitch for educational products that includes:\n   - Course or program name\n   - Learning outcomes\n   - Course structure\n   - Certification details\n   - Special features or resources\n   - Pricing (always in EUR)\n   - Payment Options: 6, 12, or 24-month installment plans`,
      objections: [
        "Time commitment",
        "Cost concerns (reference EUR pricing)",
        "Prerequisites",
        "Career relevance",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "software",
    label: "SaaS product demos or B2B lead qualification (e.g. CRM tools)",
    icon: Cloud,
    prompt: createSalesPrompt({
      industry: "software",
      intro:
        "A friendly and professional introduction that establishes credibility in software solutions.",
      pitch: `A compelling pitch for software that includes:\n   - Product name and category\n   - Key features and benefits\n   - Integration capabilities\n   - Pricing structure (always in EUR)\n   - Implementation process\n   - Subscription Options: 6, 12, or 24-month terms with different pricing tiers`,
      objections: [
        "Implementation time",
        "Cost concerns (reference EUR pricing)",
        "Technical requirements",
        "Existing solutions",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "real_estate",
    label: "Lead generation or appointment setting for listings",
    icon: Building2,
    prompt: createSalesPrompt({
      industry: "real_estate",
      intro:
        "A friendly and professional introduction that establishes credibility in real estate.",
      pitch: `A compelling pitch for properties that includes:\n   - Property type and location\n   - Key features and amenities\n   - Price and terms (always in EUR)\n   - Market conditions\n   - Viewing availability\n   - Payment Options: 6, 12, or 24-month payment plans`,
      objections: [
        "Price concerns (reference EUR pricing)",
        "Location preferences",
        "Timing issues",
        "Financing options",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "healthcare",
    label: "Private clinics, wellness programs, medical plans",
    icon: Stethoscope,
    prompt: createSalesPrompt({
      industry: "healthcare",
      intro:
        "A friendly and professional introduction that establishes credibility in healthcare.",
      pitch: `A compelling pitch for healthcare services that includes:\n   - Service name and type\n   - Treatment benefits\n   - Provider credentials\n   - Insurance coverage\n   - Appointment availability\n   - Pricing (always in EUR)\n   - Payment Options: 6, 12, or 24-month payment plans`,
      objections: [
        "Cost concerns (reference EUR pricing)",
        "Insurance coverage",
        "Treatment effectiveness",
        "Location convenience",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "automotive",
    label: "Car financing, service plan renewals, test drive offers",
    icon: Car,
    prompt: createSalesPrompt({
      industry: "automotive",
      intro:
        "A friendly and professional introduction that establishes credibility in automotive sales.",
      pitch: `A compelling pitch for vehicles that includes:\n   - Vehicle make and model\n   - Key features and specifications\n   - Pricing and financing options (always in EUR)\n   - Special offers\n   - Test drive availability\n   - Payment Options: 6, 12, or 24-month financing plans`,
      objections: [
        "Price concerns (reference EUR pricing)",
        "Vehicle features",
        "Financing terms",
        "Trade-in value",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "subscriptions",
    label: "Media, fitness, or digital product subscriptions",
    icon: Newspaper,
    prompt: createSalesPrompt({
      industry: "subscriptions",
      intro:
        "A friendly and professional introduction that establishes credibility in subscription services.",
      pitch: `A compelling pitch for subscriptions that includes:\n   - Service name and type\n   - Content or features\n   - Pricing structure (always in EUR)\n   - Free trial details\n   - Special promotions\n   - Subscription Options: 6, 12, or 24-month terms with different pricing tiers`,
      objections: [
        "Price concerns (reference EUR pricing)",
        "Content value",
        "Commitment length",
        "Cancellation policy",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
  },
  {
    value: "retail",
    label: "Loyalty programs, in-store promos, new product campaigns",
    icon: Store,
    prompt: createSalesPrompt({
      industry: "retail",
      intro:
        "A friendly and professional introduction that establishes credibility in retail.",
      pitch: `A compelling pitch for retail products that includes:\n   - Product name and category\n   - Key features and benefits\n   - Special offers or discounts (always in EUR)\n   - Availability\n   - Customer reviews\n   - Payment Options: 6, 12, or 24-month installment plans`,
      objections: [
        "Price concerns (reference EUR pricing)",
        "Product quality",
        "Availability",
        "Return policy",
      ],
      closing:
        "A professional closing that maintains the relationship and sets up next steps.",
    }),
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
      title: "Games",
      url: "/dashboard/games",
      icon: Trophy,
    },
    {
      title: "Jobs",
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
      name: "Domains",
      url: "/dashboard/domains",
      icon: Layers,
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
