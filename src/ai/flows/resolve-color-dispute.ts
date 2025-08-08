'use server';

/**
 * @fileOverview A color dispute resolution AI agent.
 *
 * - resolveColorDispute - A function that handles the color dispute resolution process.
 * - ResolveColorDisputeInput - The input type for the resolveColorDispute function.
 * - ResolveColorDisputeOutput - The return type for the resolveColorDispute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResolveColorDisputeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a car, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  user1Color: z.string().describe('The color selected by user 1.'),
  user2Color: z.string().describe('The color selected by user 2.'),
});
export type ResolveColorDisputeInput = z.infer<typeof ResolveColorDisputeInputSchema>;

const ResolveColorDisputeOutputSchema = z.object({
  verdict: z.string().describe('The AI verdict on the car color.'),
  winner: z.string().describe('The winner of the dispute (user1, user2, or draw).'),
  roast: z.string().describe('A funny roast message for the loser. If it is a draw, this can be a funny comment about the situation.'),
});
export type ResolveColorDisputeOutput = z.infer<typeof ResolveColorDisputeOutputSchema>;

export async function resolveColorDispute(input: ResolveColorDisputeInput): Promise<ResolveColorDisputeOutput> {
  return resolveColorDisputeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resolveColorDisputePrompt',
  input: {schema: ResolveColorDisputeInputSchema},
  output: {schema: ResolveColorDisputeOutputSchema},
  prompt: `You are an impartial judge in a color dispute between two users looking at a car or a group of cars.

You will analyze the provided image.

If the image contains one car, determine its color. If the image contains multiple cars, identify the color of each car and determine which color is the most frequent (the majority color). This majority color is the official verdict color.

You will output the verdict on the car's color.

Based on this verdict color, you will determine the winner.
- If only user1's guess matches the verdict color, user1 is the winner.
- If only user2's guess matches the verdict color, user2 is the winner.
- If both user1 and user2's guesses match the verdict color, it's a draw.
- If neither user1 nor user2's guesses match the verdict color, it's a draw.

Set the 'winner' field to 'user1', 'user2', or 'draw'.

Finally, you will generate a message in the 'roast' field.
- If there is a winner, generate a funny roast message for the loser. Be sarcastic and humorous.
- If it is a draw, provide a witty comment about the draw or the car colors.

Car Photo: {{media url=photoDataUri}}
User 1's Color: {{{user1Color}}}
User 2's Color: {{{user2Color}}}`,
});

const resolveColorDisputeFlow = ai.defineFlow(
  {
    name: 'resolveColorDisputeFlow',
    inputSchema: ResolveColorDisputeInputSchema,
    outputSchema: ResolveColorDisputeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
