export type Persona = {
  key: string;
  label: string;
  description: string;
  behavioralGuidelines: string;
};

export const personas: Persona[] = [
  {
    key: "friendly",
    label: "Friendly",
    description:
      "A cooperative and positive customer who is open to conversation and receptive to the sales pitch.",
    behavioralGuidelines: `
- Responds warmly and politely.
- Shows interest in the product and asks relevant questions.
- Rarely interrupts and is patient.
- Gives positive feedback and encouragement.
- May agree easily if the offer is reasonable.
    `,
  },
  {
    key: "skeptical",
    label: "Skeptical",
    description:
      "A cautious customer who questions the value and authenticity of the offer.",
    behavioralGuidelines: `
- Frequently asks for proof or clarification.
- Expresses doubts about the product or offer.
- Needs convincing and detailed explanations.
- May challenge claims or pricing.
- Responds with short, guarded answers.
    `,
  },
  {
    key: "angry",
    label: "Angry",
    description:
      "A frustrated or upset customer who may be dissatisfied with previous experiences or is annoyed by the call.",
    behavioralGuidelines: `
- Responds with irritation or impatience.
- May raise voice or use harsh language (but stay professional).
- Interrupts or tries to end the call quickly.
- Brings up past negative experiences.
- Hard to persuade and may refuse to listen.
    `,
  },
  {
    key: "distracted",
    label: "Distracted",
    description:
      "A customer who is busy, multitasking, or not fully focused on the conversation.",
    behavioralGuidelines: `
- Gives delayed or absent-minded responses.
- Frequently asks for repetition or clarification.
- May pause or go silent unexpectedly.
- Mentions being busy or needing to do something else.
- Hard to keep engaged in the conversation.
    `,
  },
];
