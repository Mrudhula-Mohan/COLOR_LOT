'use server';

/**
 * @fileOverview An AI agent for generating a car's "horoscope" from an image.
 *
 * - horoscopeFromImage - A function that detects a car's color from an image and then generates a personality description.
 * - HoroscopeFromImageInput - The input type for the horoscopeFromImage function.
 * - HoroscopeFromImageOutput - The return type for the horoscopeFromImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { detectCarColor, DetectCarColorOutput } from './detect-car-color';
import { carHoroscope, CarHoroscopeOutput } from './car-horoscope';

const HoroscopeFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a car, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type HoroscopeFromImageInput = z.infer<typeof HoroscopeFromImageInputSchema>;

const HoroscopeFromImageOutputSchema = z.object({
    color: z.string().describe("The detected color of the car."),
    horoscope: z.string().describe("A fun, horoscope-style personality description for the car based on its color. It should be 2-3 sentences long."),
    funnyColorName: z.string().describe("A funny and creative nickname for the car's color."),
});
export type HoroscopeFromImageOutput = z.infer<typeof HoroscopeFromImageOutputSchema>;


export async function horoscopeFromImage(input: HoroscopeFromImageInput): Promise<HoroscopeFromImageOutput> {
  return horoscopeFromImageFlow(input);
}


const horoscopeFromImageFlow = ai.defineFlow(
  {
    name: 'horoscopeFromImageFlow',
    inputSchema: HoroscopeFromImageInputSchema,
    outputSchema: HoroscopeFromImageOutputSchema,
  },
  async (input) => {
    const colorDetectionResult = await detectCarColor(input);

    if (colorDetectionResult.colorCounts.length === 0) {
        throw new Error("No car color could be detected in the image.");
    }
    
    // Use the most prominent color for the horoscope
    const dominantColor = colorDetectionResult.colorCounts.sort((a,b) => b.count - a.count)[0].color;
    
    const horoscopeResult = await carHoroscope({ color: dominantColor });
    
    return {
        color: dominantColor,
        horoscope: horoscopeResult.horoscope,
        funnyColorName: horoscopeResult.funnyColorName
    };
  }
);
