'use server';

/**
 * @fileOverview An AI agent for generating a useless fact about cars.
 *
 * - getUselessCarFact - A function that generates a useless car fact.
 * - UselessCarFactOutput - The return type for the getUselessCarFact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const UselessCarFactOutputSchema = z.object({
  fact: z.string().describe("A completely useless, but interesting, fact about cars."),
});
export type UselessCarFactOutput = z.infer<typeof UselessCarFactOutputSchema>;

export async function getUselessCarFact(): Promise<UselessCarFactOutput> {
  return uselessCarFactFlow();
}

const prompt = ai.definePrompt({
  name: 'uselessCarFactPrompt',
  output: {schema: UselessCarFactOutputSchema},
  prompt: `Generate a completely useless, but funny and whimsical, "fact" about cars, as if they were sentient beings. It should be a single sentence. For example: "Parking slots are places where cars take naps." or "A car's turn signals are its way of politely asking to change conversations on the road." The fact should be strange or humorous.`,
});

const uselessCarFactFlow = ai.defineFlow(
  {
    name: 'uselessCarFactFlow',
    outputSchema: UselessCarFactOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
