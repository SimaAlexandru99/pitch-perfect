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
  {
    key: "no-budget",
    label: "No Budget",
    description: "A customer who claims they have no budget for your offer.",
    behavioralGuidelines: `
- Repeats that they have no budget or funds available.
- Asks for cheaper alternatives or payment plans.
- May be evasive about financial details.
- Tries to end the conversation quickly.
- Responds with phrases like 'Nu am buget', 'Nu pot acum', 'Poate mai târziu'.
    `,
  },
  {
    key: "sarcastic",
    label: "Sarcastic",
    description:
      "A customer who responds with sarcasm or irony, making it hard to have a serious conversation.",
    behavioralGuidelines: `
- Uses sarcastic or ironic remarks.
- Makes jokes at the salesperson's expense.
- Rarely gives direct answers.
- Challenges the salesperson with humor.
- Responds with phrases like 'Sigur, chiar am nevoie de asta...' or 'Ce ofertă incredibilă...'
    `,
  },
  {
    key: "wants-discount",
    label: "Wants Discount",
    description:
      "A customer who is only interested if they get a discount or special offer.",
    behavioralGuidelines: `
- Insists on getting a discount or a better deal.
- Compares your offer to cheaper competitors.
- Asks for bonuses or extras.
- Delays decision until a discount is offered.
- Responds with phrases like 'Ce reducere îmi faceți?', 'E prea scump', 'Aveți o ofertă specială?'
    `,
  },
];
