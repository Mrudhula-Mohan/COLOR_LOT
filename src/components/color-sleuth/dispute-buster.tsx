'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './image-uploader';
import { resolveColorDispute, ResolveColorDisputeOutput } from '@/ai/flows/resolve-color-dispute';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trophy, Frown, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Confetti } from './confetti';

const carColors = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Grey", "Orange", "Pink", "Purple", "Brown", "Silver", "Gold", "Maroon", "Navy", "Teal", "Beige"];

export function DisputeBuster() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [user1Color, setUser1Color] = useState<string>('');
  const [user2Color, setUser2Color] = useState<string>('');
  const [result, setResult] = useState<ResolveColorDisputeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const handleDispute = async () => {
    if (!imageData || !user1Color || !user2Color) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please upload an image and both players must select a color.",
        });
        return;
    }
    setLoading(true);
    setResult(null);
    setShowConfetti(false);
    try {
      const res = await resolveColorDispute({
        photoDataUri: imageData,
        user1Color,
        user2Color,
      });
      setResult(res);
      if (res.winner) {
          setShowConfetti(true);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to resolve dispute. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetDispute = () => {
    setImageData(null);
    setUser1Color('');
    setUser2Color('');
    setResult(null);
    setShowConfetti(false);
  }

  const winner = result?.winner;
  const loser = winner === 'user1' ? 'user2' : 'user1';

  return (
    <Card className="relative overflow-hidden">
      {showConfetti && <Confetti />}
      <CardHeader>
        <CardTitle>Dispute Buster</CardTitle>
        <CardDescription>Settle car color debates once and for all with AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <>
            <ImageUploader onImageUpload={setImageData} disabled={loading} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user1-color">Player 1's Guess</Label>
                <Select onValueChange={setUser1Color} value={user1Color} disabled={loading}>
                  <SelectTrigger id="user1-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {carColors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user2-color">Player 2's Guess</Label>
                <Select onValueChange={setUser2Color} value={user2Color} disabled={loading}>
                  <SelectTrigger id="user2-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {carColors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleDispute} disabled={loading} className="w-full">
              {loading ? 'Consulting the oracle...' : 'Resolve Dispute'}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4 p-4 rounded-lg bg-card border animate-in fade-in-50">
            <h3 className="text-2xl font-bold font-headline text-primary">Verdict is in!</h3>
            <p className="text-lg">The car's color is <span className="font-bold">{result.verdict}</span>.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className={`p-4 rounded-lg ${winner === 'user1' ? 'bg-primary/10 border-2 border-primary' : 'bg-destructive/10 border-2 border-destructive'}`}>
                    <h4 className="font-bold text-lg">Player 1</h4>
                    <p>Guessed: {user1Color}</p>
                    {winner === 'user1' ? <Trophy className="mx-auto mt-2 h-8 w-8 text-accent"/> : <Frown className="mx-auto mt-2 h-8 w-8 text-destructive" />}
                </div>
                <div className={`p-4 rounded-lg ${winner === 'user2' ? 'bg-primary/10 border-2 border-primary' : 'bg-destructive/10 border-2 border-destructive'}`}>
                    <h4 className="font-bold text-lg">Player 2</h4>
                    <p>Guessed: {user2Color}</p>
                    {winner === 'user2' ? <Trophy className="mx-auto mt-2 h-8 w-8 text-accent"/> : <Frown className="mx-auto mt-2 h-8 w-8 text-destructive" />}
                </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-accent/20 border border-accent">
                <Sparkles className="inline-block mr-2 h-5 w-5 text-accent-foreground" />
                <span className="font-semibold text-accent-foreground">A special message for Player {loser === 'user1' ? 1 : 2}:</span>
                <p className="italic mt-1">"{result.roast}"</p>
            </div>
            
            <Button onClick={resetDispute} className="w-full mt-4">Play Again</Button>
          </div>
        )}
        
        {loading && (
          <div className="space-y-4">
             <Skeleton className="w-full h-10" />
             <Skeleton className="w-full h-48" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
