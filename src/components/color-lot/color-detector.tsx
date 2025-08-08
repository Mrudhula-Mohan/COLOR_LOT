
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './image-uploader';
import { detectCarColor, DetectCarColorOutput } from '@/ai/flows/detect-car-color';
import { getUselessCarFact } from '@/ai/flows/get-useless-car-fact';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export function ColorDetector() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<DetectCarColorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [funFact, setFunFact] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!imageData) return;
    setLoading(true);
    setResult(null);
    setFunFact(null);
    try {
      const [res, factRes] = await Promise.all([
        detectCarColor({ photoDataUri: imageData }),
        getUselessCarFact()
      ]);
      setResult(res);
      setFunFact(factRes.fact);
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
    setFunFact(null);
  }

  const chartConfig = result?.colorCounts.reduce((acc, { color }) => {
    const colorKey = color.toLowerCase();
    acc[colorKey] = {
      label: color.charAt(0).toUpperCase() + color.slice(1),
      color: colorKey === 'multicolored' ? 'hsl(var(--primary))' : colorKey,
    };
    return acc;
  }, {} as ChartConfig) || {};
  
  const chartData = result?.colorCounts.map(item => ({
    name: item.color,
    count: item.count,
    fill: `var(--color-${item.color.toLowerCase()})`,
  }));

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
            <div className="space-y-6">
                <div className="text-center p-6 rounded-lg bg-secondary/50 border animate-in fade-in-50">
                    <h3 className="text-xl font-bold text-foreground mb-4">Detection Results</h3>
                    <p className="text-lg text-foreground">
                        Total cars detected: <span className="font-bold text-primary">{result.totalCars}</span>
                    </p>
                    {result.multiColoredCarsCount > 0 && (
                        <p className="text-lg text-foreground mt-2">
                            Multicolored cars: <span className="font-bold text-primary">{result.multiColoredCarsCount}</span>
                        </p>
                    )}
                </div>
                {chartData && chartData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-center">Color Breakdown</h4>
                        <ul className="divide-y divide-border max-h-60 overflow-y-auto border rounded-md p-2">
                            {result.colorCounts.map((item, index) => (
                                <li key={index} className="flex justify-between items-center py-2 px-2">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-5 h-5 rounded-full border border-slate-300"
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
                    <div className="flex flex-col gap-4">
                      <h4 className="font-semibold text-center">Color Distribution</h4>
                      <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <BarChart data={chartData} accessibilityLayer>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                          />
                          <YAxis />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Bar dataKey="count" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                    <p className="mt-4 text-center text-muted-foreground">No cars were detected to generate a chart.</p>
                )}
                {funFact && (
                    <div className="!mt-8 pt-4 border-t border-border/50 text-center">
                        <p className="text-base italic">"{funFact}"</p>
                    </div>
                )}
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
