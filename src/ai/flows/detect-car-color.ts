
'use server';

/**
 * @fileOverview An AI agent for detecting the colors of cars in an image and counting them.
 *
 * - detectCarColor - A function that handles the car color detection and counting process.
 * - DetectCarColorInput - The input type for the detectCarColor function.
 * - DetectCarColorOutput - The return type for the detectCarColor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DetectCarColorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a car or cars, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectCarColorInput = z.infer<typeof DetectCarColorInputSchema>;

const DetectCarColorOutputSchema = z.object({
  totalCars: z.number().describe("The total number of cars detected in the image."),
  colorCounts: z.array(z.object({
    color: z.string().describe("The color of the car. For cars with multiple colors, this should be 'multicolored'."),
    count: z.number().describe("The number of cars of this color."),
  })).describe("An array of objects, each containing a color and the count of cars with that color. If no cars are found, this should be an empty array."),
  multiColoredCarsCount: z.number().describe("The number of cars that have more than one distinct color. If none, this should be 0."),
});
export type DetectCarColorOutput = z.infer<typeof DetectCarColorOutputSchema>;

export async function detectCarColor(input: DetectCarColorInput): Promise<DetectCarColorOutput> {
  return detectCarColorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCarColorPrompt',
  input: {schema: DetectCarColorInputSchema},
  output: {schema: DetectCarColorOutputSchema},
  prompt: `You are an expert in identifying car colors from an image.
  Analyze the provided image and identify the exact number of cars present.
  Provide the total count of all cars found in the \`totalCars\` field.
  For each color you identify, count the number of cars of that color and return it in the \`colorCounts\` array.
  If a car has more than one significant color (e.g., racing stripes, two-tone paint), you should count it as a single 'multicolored' car.
  The \`colorCounts\` array should include an entry for 'multicolored' if any such cars are found.
  The \`multiColoredCarsCount\` field should contain the total count of these multicolored cars. If there are none, this value must be 0.
  Your response must be in the specified JSON format.
  If no cars are visible, you MUST return a 'totalCars' of 0, an empty 'colorCounts' array, and a 'multiColoredCarsCount' of 0.

  Here is the image:
  {{media url=photoDataUri}}`,
});

const detectCarColorFlow = ai.defineFlow(
  {
    name: 'detectCarColorFlow',
    inputSchema: DetectCarColorInputSchema,
    outputSchema: DetectCarColorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
