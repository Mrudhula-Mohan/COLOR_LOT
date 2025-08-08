
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './image-uploader';
import { detectCarMood, DetectCarMoodOutput } from '@/ai/flows/detect-car-mood';
import { getUselessCarFact } from '@/ai/flows/get-useless-car-fact';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { Gauge, HeartPulse } from 'lucide-react';

export function DashFeel() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<DetectCarMoodOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [funFact, setFunFact] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!imageData) {
        toast({
            variant: "destructive",
            title: "No Image Provided",
            description: "Please upload an image of a car to feel its vibe.",
        });
        return;
    }
    setLoading(true);
    setResult(null);
    setFunFact(null);
    try {
      const [res, factRes] = await Promise.all([
        detectCarMood({ photoDataUri: imageData }),
        getUselessCarFact()
      ]);

      setResult(res);
      setFunFact(factRes.fact);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not determine the car's mood. The car might be too mysterious.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewDetection = () => {
    setImageData(null);
    setResult(null);
    setFunFact(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DashFeel</CardTitle>
        <CardDescription>How is your car feeling today? Upload a photo to find out its mood based on its appearance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && !loading ? (
            <>
            <ImageUploader onImageUpload={setImageData} disabled={loading} />
            <Button onClick={handleAnalysis} disabled={!imageData || loading} className="w-full">
                {loading ? 'Reading the vibes...' : 'Check Mood'}
            </Button>
            </>
        ) : null}

        {loading && (
          <div className="space-y-4 pt-4">
             <div className="flex justify-center">
                <HeartPulse className="mx-auto h-12 w-12 text-primary animate-pulse" />
             </div>
             <Skeleton className="w-1/3 mx-auto h-8" />
             <Skeleton className="w-full h-12" />
             <Skeleton className="w-1/2 mx-auto h-10" />
          </div>
        )}

        {!loading && result && (
            <div className="text-center space-y-4 p-4 rounded-lg bg-card border animate-in fade-in-50">
                <Gauge className="mx-auto h-12 w-12 text-accent" />
                <h3 className="text-2xl font-bold font-headline text-primary">
                    Mood: {result.mood}
                </h3>
                <p className="text-lg italic">"{result.reason}"</p>

                {funFact && (
                    <div className="!mt-8 pt-4 border-t border-border/50">
                        <p className="text-base italic">"{funFact}"</p>
                    </div>
                )}

                <Button onClick={handleNewDetection} className="w-full mt-4">Check Another Car</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
