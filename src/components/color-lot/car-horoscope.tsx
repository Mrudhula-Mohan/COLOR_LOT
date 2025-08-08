
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { carHoroscope, CarHoroscopeOutput } from '@/ai/flows/car-horoscope';
import { horoscopeFromImage, HoroscopeFromImageOutput } from '@/ai/flows/horoscope-from-image';
import { getUselessCarFact } from '@/ai/flows/get-useless-car-fact';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from './image-uploader';

const carColors = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Grey", "Orange", "Pink", "Purple", "Brown", "Silver", "Gold", "Maroon", "Navy", "Teal", "Beige"];

export function CarHoroscope() {
  const [mode, setMode] = useState<'color' | 'image'>('color');
  const [color, setColor] = useState<string>('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<HoroscopeFromImageOutput | CarHoroscopeOutput | null>(null);
  const [detectedColor, setDetectedColor] = useState<string | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleHoroscope = async () => {
    if (mode === 'color' && !color) {
        toast({
            variant: "destructive",
            title: "No Color Selected",
            description: "Please select a car color to get its horoscope.",
        });
        return;
    }
    if (mode === 'image' && !imageData) {
        toast({
            variant: "destructive",
            title: "No Image Uploaded",
            description: "Please upload an image of a car to get its horoscope.",
        });
        return;
    }

    setLoading(true);
    setResult(null);
    setDetectedColor(null);
    setFunFact(null);

    try {
      let horoscopePromise;
      if (mode === 'image' && imageData) {
        horoscopePromise = horoscopeFromImage({ photoDataUri: imageData });
      } else {
        horoscopePromise = carHoroscope({ color });
      }

      const [horoscopeRes, factRes] = await Promise.all([
          horoscopePromise,
          getUselessCarFact()
      ]);

      if ('color' in horoscopeRes && horoscopeRes.color) {
        setDetectedColor(horoscopeRes.color);
      }
      
      setResult(horoscopeRes);
      setFunFact(factRes.fact);

    } catch (error) {
      console.error(error);
      let description = "Failed to generate car horoscope. Please try again.";
      if (error instanceof Error && error.message.includes("No car color could be detected")) {
        description = "We couldn't detect a car in the image. Please try a different one.";
      }
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const reset = () => {
    setColor('');
    setImageData(null);
    setResult(null);
    setDetectedColor(null);
    setFunFact(null);
  }

  const handleImageUpload = (dataUri: string) => {
    setImageData(dataUri);
  }
  
  const handleModeChange = (newMode: 'color' | 'image') => {
    setMode(newMode);
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Horoscope</CardTitle>
        <CardDescription>What does your car's color say about its personality? Select a color or upload a photo to find out!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && !loading ? (
          <>
            <div className="flex justify-center space-x-2 rounded-md bg-muted p-1">
                <Button variant={mode === 'color' ? 'default' : 'ghost'} onClick={() => handleModeChange('color')} className="w-full">
                    By Color
                </Button>
                <Button variant={mode === 'image' ? 'default' : 'ghost'} onClick={() => handleModeChange('image')} className="w-full">
                    By Image
                </Button>
            </div>
          
            {mode === 'color' && (
              <div className="space-y-4 animate-in fade-in-50">
                  <div className="space-y-2">
                      <Label htmlFor="car-color">Car Color</Label>
                      <Select onValueChange={setColor} value={color} disabled={loading}>
                        <SelectTrigger id="car-color">
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {carColors.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                  <Button onClick={handleHoroscope} disabled={!color || loading} className="w-full">
                    {loading ? 'Consulting the stars...' : 'Get Horoscope'}
                  </Button>
              </div>
            )}

            {mode === 'image' && (
              <div className="space-y-4 animate-in fade-in-50">
                <ImageUploader onImageUpload={handleImageUpload} disabled={loading} />
                {imageData && !loading && (
                    <Button onClick={() => setImageData(null)} variant="ghost" className="w-full text-muted-foreground">
                        <XCircle className="mr-2" />
                        Clear Image
                    </Button>
                )}
                 <Button onClick={handleHoroscope} disabled={!imageData || loading} className="w-full">
                    {loading ? 'Consulting the stars...' : 'Get Horoscope from Image'}
                 </Button>
              </div>
            )}
          </>
        ) : null}

        {loading && (
          <div className="space-y-4 pt-4">
             <div className="flex justify-center">
                <Sparkles className="mx-auto h-12 w-12 text-accent animate-spin" />
             </div>
             <Skeleton className="w-1/3 mx-auto h-8" />
             <Skeleton className="w-full h-12" />
             <Skeleton className="w-1/2 mx-auto h-10" />
          </div>
        )}
        
        {!loading && result && (
          <div className="text-center space-y-4 p-4 rounded-lg bg-card border animate-in fade-in-50">
            <Sparkles className="mx-auto h-12 w-12 text-accent" />
            <h3 className="text-2xl font-bold font-headline text-primary">
              {result.funnyColorName ? `"${result.funnyColorName}"` : (detectedColor || color)}
            </h3>
            {result.funnyColorName && <p className="text-sm text-muted-foreground -mt-2 mb-2">(Also known as {detectedColor || color})</p>}

            <p className="text-lg italic">"{result.horoscope}"</p>

            {funFact && (
                <div className="!mt-8 pt-4 border-t border-border/50">
                    <p className="text-base italic">"{funFact}"</p>
                </div>
            )}

            <Button onClick={reset} className="w-full mt-4">Try Another</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
