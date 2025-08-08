'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './image-uploader';
import { detectCarColor, DetectCarColorOutput } from '@/ai/flows/detect-car-color';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

export function ColorDetector() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<DetectCarColorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!imageData) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await detectCarColor({ photoDataUri: imageData });
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to detect car colors. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewDetection = () => {
    setImageData(null);
    setResult(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Color Detector</CardTitle>
        <CardDescription>Upload a picture of a parking lot or a street to get a count of cars, a breakdown of their colors, and identify any multicolored vehicles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
            <>
            <ImageUploader onImageUpload={setImageData} disabled={loading} />
            <Button onClick={handleAnalysis} disabled={!imageData || loading} className="w-full">
                {loading ? 'Analyzing...' : 'Analyze Image'}
            </Button>
            </>
        ) : (
            <div className="text-center space-y-4">
                <div className="p-6 rounded-lg bg-secondary/50 border animate-in fade-in-50">
                    <h3 className="text-xl font-bold text-foreground mb-4">Detection Results</h3>
                    <p className="text-lg text-foreground">
                        Total cars detected: <span className="font-bold text-primary">{result.totalCars}</span>
                    </p>
                    {result.multiColoredCarsCount > 0 && (
                        <p className="text-lg text-foreground mt-2">
                            Multicolored cars: <span className="font-bold text-primary">{result.multiColoredCarsCount}</span>
                        </p>
                    )}
                    {result.colorCounts && result.colorCounts.length > 0 ? (
                        <div className="mt-4 space-y-2 text-left">
                            <h4 className="font-semibold text-center">Color Breakdown:</h4>
                            <ul className="divide-y divide-border max-h-60 overflow-y-auto">
                                {result.colorCounts.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center py-2 px-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-6 h-6 rounded-full border border-slate-300"
                                                style={{
                                                    background: item.color.toLowerCase() === 'multicolored'
                                                        ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
                                                        : item.color.toLowerCase()
                                                }}
                                            />
                                            <span className="capitalize">{item.color}</span>
                                        </div>
                                        <span className="font-bold">{item.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="mt-4 text-muted-foreground">No cars were detected in the image.</p>
                    )}
                </div>
                <Button onClick={handleNewDetection} className="w-full">Analyze Another Image</Button>
            </div>
        )}

        {loading && (
          <div className="space-y-4 pt-4">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-48" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
