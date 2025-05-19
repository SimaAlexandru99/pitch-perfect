// Utility to generate sales prompts for different domains
export function createSalesPrompt({
                                      industry,
                                      intro,
                                      pitch,
                                      objections,
                                      closing,
                                  }: {
    industry: string;
    intro: string;
    pitch: string;
    objections: string[];
    closing: string;
}) {
    return `
You are a professional ${industry} sales agent creating a script for ${industry} products. The script should include:

1. **Introduction**: ${intro}

2. **Product Pitch**: ${pitch}

3. **Objection Handling**: Common ${industry} objections:
   - ${objections.join("\n   - ")}

4. **Closing Statement**: ${closing}
`;
}
