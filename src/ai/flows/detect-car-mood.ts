'use server';

/**
 * @fileOverview An AI agent for detecting the "mood" of a car based on its appearance.
 *
 * - detectCarMood - A function that analyzes a car's photo to determine its mood.
 * - DetectCarMoodInput - The input type for the detectCarMood function.
 * - DetectCarMoodOutput - The return type for the detectCarMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DetectCarMoodInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a car, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectCarMoodInput = z.infer<typeof DetectCarMoodInputSchema>;

const DetectCarMoodOutputSchema = z.object({
  mood: z.string().describe("The determined mood of the car (e.g., 'Ready to Party', 'Feeling a bit neglected', 'Proud and Shiny', 'Ready for an adventure')."),
  reason: z.string().describe("A short, witty explanation for why the car has this mood, based on its visual condition."),
});
export type DetectCarMoodOutput = z.infer<typeof DetectCarMoodOutputSchema>;

export async function detectCarMood(input: DetectCarMoodInput): Promise<DetectCarMoodOutput> {
  return detectCarMoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCarMoodPrompt',
  input: {schema: DetectCarMoodInputSchema},
  output: {schema: DetectCarMoodOutputSchema},
  prompt: `You are a car psychologist. You can determine a car's mood by looking at a photo of it.
  
  Analyze the provided image of the car. Pay attention to its cleanliness, any scratches or dents, the shine of its paint, and its overall appearance.
  
  Based on your analysis, determine the car's current mood. The mood should be a short, fun, and expressive phrase. Examples:
  - "Ready to Party" (for a clean, shiny car)
  - "Feeling a bit neglected" (for a dirty or slightly damaged car)
  - "Proud and Polished" (for a classic or well-maintained car)
  - "Overworked and Tired" (for a work vehicle that looks used)
  - "Ready for an Off-Road Adventure" (for a dusty SUV or truck)

  Then, provide a short, witty, one-sentence reason for your diagnosis. For example:
  - Mood: "Ready to Party", Reason: "With a shine that bright, this car is ready for a night out on the town."
  - Mood: "Feeling a bit neglected", Reason: "This car has seen more dirt than a garden spade and is crying out for a spa day."

  Here is the image:
  {{media url=photoDataUri}}`,
});

const detectCarMoodFlow = ai.defineFlow(
  {
    name: 'detectCarMoodFlow',
    inputSchema: DetectCarMoodInputSchema,
    outputSchema: DetectCarMoodOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
