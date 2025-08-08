
import { Button } from "@/components/ui/button";
import { Palette, Car } from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <main className="text-center p-8">
        <Car className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
          COLOR LOT
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-foreground/80 mb-8">
          Colors. Cars. Chaos.
        </p>
        <Link href="/main" passHref>
          <Button size="lg">
            Get Started <Palette className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </main>
      <footer className="absolute bottom-8 text-sm text-muted-foreground">
        <p>Powered by AI. Handle with fun.</p>
      </footer>
    </div>
  );
}
