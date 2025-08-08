'use server';

/**
 * @fileOverview An AI agent for generating a car's "horoscope" or personality based on its color.
 *
 * - carHoroscope - A function that generates a personality description for a car color.
 * - CarHoroscopeInput - The input type for the carHoroscope function.
 * - CarHoroscopeOutput - The return type for the carHoroscope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CarHoroscopeInputSchema = z.object({
  color: z.string().describe('The color of the car.'),
});
export type CarHoroscopeInput = z.infer<typeof CarHoroscopeInputSchema>;

const CarHoroscopeOutputSchema = z.object({
  horoscope: z.string().describe("A fun, horoscope-style personality description for the car based on its color. It should be 2-3 sentences long."),
  funnyColorName: z.string().describe("A funny and creative nickname for the car's color. For example, 'Angry Tomato' for red, or 'Grumpy Cloud' for grey."),
});
export type CarHoroscopeOutput = z.infer<typeof CarHoroscopeOutputSchema>;

export async function carHoroscope(input: CarHoroscopeInput): Promise<CarHoroscopeOutput> {
  return carHoroscopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'carHoroscopePrompt',
  input: {schema: CarHoroscopeInputSchema},
  output: {schema: CarHoroscopeOutputSchema},
  prompt: `You are a mystical and witty car astrologer. Given a car's color, you can determine its personality, destiny, and a funny nickname.
  
  First, create a funny and creative nickname for the car's color. For example, for "Red", you could use "Angry Tomato", for "Grey" you could use "Grumpy Cloud", or for "White" you could use "Suspiciously Clean".
  
  Second, create a short, fun, and slightly quirky "horoscope" or personality description for a car of the following color: {{{color}}}.
  
  For example, for a "Red" car, you might say: "This car is a firecracker, always ready to go. It loves attention and has a bit of a temper in traffic."
  
  Keep the horoscope to 2-3 sentences.
  
  Provide the output in the specified JSON format.
  `,
});

const carHoroscopeFlow = ai.defineFlow(
  {
    name: 'carHoroscopeFlow',
    inputSchema: CarHoroscopeInputSchema,
    outputSchema: CarHoroscopeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
