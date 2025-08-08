
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './image-uploader';
import { resolveColorDispute, ResolveColorDisputeOutput } from '@/ai/flows/resolve-color-dispute';
import { getUselessCarFact } from '@/ai/flows/get-useless-car-fact';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trophy, Frown, Sparkles, Handshake } from 'lucide-react';
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
  const [funFact, setFunFact] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      setShowResult(true);
      if (result?.winner && result.winner !== 'draw') {
        setShowConfetti(true);
      }
    }
  }, [countdown, result]);


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
    setFunFact(null);
    setShowResult(false);
    setCountdown(null);

    try {
      const [res, factRes] = await Promise.all([
        resolveColorDispute({
          photoDataUri: imageData,
          user1Color,
          user2Color,
        }),
        getUselessCarFact()
      ]);

      setResult(res);
      setFunFact(factRes.fact);
      setCountdown(3);

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
    setFunFact(null);
    setShowResult(false);
    setCountdown(null);
  }

  const winner = result?.winner;
  const loser = winner === 'user1' ? 'user2' : (winner === 'user2' ? 'user1' : null);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
           <Skeleton className="w-full h-10" />
           <Skeleton className="w-full h-48" />
        </div>
      );
    }

    if (countdown !== null && !showResult) {
      return (
        <div className="text-center space-y-4 p-4 rounded-lg bg-card border animate-in fade-in-50">
          <h3 className="text-2xl font-bold font-headline text-primary">The verdict is in!</h3>
          <p className="text-lg">Revealing the winner in...</p>
          <div className="text-6xl font-bold text-accent animate-ping">
            {countdown > 0 ? countdown : ''}
          </div>
        </div>
      );
    }

    if (result && showResult) {
      return (
        <div className="text-center space-y-4 p-4 rounded-lg bg-card border animate-in fade-in-50">
          <h3 className="text-2xl font-bold font-headline text-primary">Verdict is in!</h3>
          <p className="text-lg">The official color is <span className="font-bold">{result.verdict}</span>.</p>
          
          {winner === 'draw' ? (
              <>
                <div className="mt-4 p-4 rounded-lg bg-accent/20 border border-accent">
                    <Sparkles className="inline-block mr-2 h-5 w-5 text-accent-foreground" />
                    <span className="font-semibold text-accent-foreground">It's a draw!</span>
                    <p className="italic mt-1">"{result.roast}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-secondary/50 border">
                      <h4 className="font-bold text-lg">Player 1</h4>
                      <p>Guessed: {user1Color}</p>
                      <Handshake className="mx-auto mt-2 h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 border">
                      <h4 className="font-bold text-lg">Player 2</h4>
                      <p>Guessed: {user2Color}</p>
                      <Handshake className="mx-auto mt-2 h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </>
          ) : (
            <>
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

              {loser && (
                <div className="mt-4 p-4 rounded-lg bg-accent/20 border border-accent">
                    <Sparkles className="inline-block mr-2 h-5 w-5 text-accent-foreground" />
                    <span className="font-semibold text-accent-foreground">A special message for Player {loser === 'user1' ? 1 : 2}:</span>
                    <p className="italic mt-1">"{result.roast}"</p>
                </div>
              )}
            </>
          )}

          {funFact && (
              <div className="!mt-8 pt-4 border-t border-border/50">
                  <p className="text-base italic">"{funFact}"</p>
              </div>
          )}
          
          <Button onClick={resetDispute} className="w-full mt-4">Play Again</Button>
        </div>
      );
    }

    return (
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
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {showConfetti && <Confetti />}
      <CardHeader>
        <CardTitle>Dispute Buster</CardTitle>
        <CardDescription>Settle car color debates once and for all with AI. If there are multiple cars, the most common color wins!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
