
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DisputeBuster } from "@/components/color-lot/dispute-buster"
import { ColorDetector } from "@/components/color-lot/color-detector"
import { CarHoroscope } from "@/components/color-lot/car-horoscope"
import { DashFeel } from "@/components/color-lot/dash-feel"
import { Palette, Swords, Home, Sparkles, Gauge } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MainPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <header className="relative text-center mb-8 md:mb-12">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="absolute top-0 left-0">
              <Home className="h-6 w-6" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-primary tracking-tight">
            COLOR LOT
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
            Your AI assistant for color debates.
          </p>
        </header>
        
        <Tabs defaultValue="color-detector" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 h-auto sm:h-12">
            <TabsTrigger value="color-detector" className="py-2.5">
              <Palette className="mr-2 h-5 w-5" />
              Color Detector
            </TabsTrigger>
            <TabsTrigger value="dispute-buster" className="py-2.5">
              <Swords className="mr-2 h-5 w-5" />
              Dispute Buster
            </TabsTrigger>
            <TabsTrigger value="car-horoscope" className="py-2.5">
              <Sparkles className="mr-2 h-5 w-5" />
              Car Horoscope
            </TabsTrigger>
            <TabsTrigger value="dash-feel" className="py-2.5">
              <Gauge className="mr-2 h-5 w-5" />
              DashFeel
            </TabsTrigger>
          </TabsList>
          <TabsContent value="color-detector" className="mt-6">
            <ColorDetector />
          </TabsContent>
          <TabsContent value="dispute-buster" className="mt-6">
            <DisputeBuster />
          </TabsContent>
          <TabsContent value="car-horoscope" className="mt-6">
            <CarHoroscope />
          </TabsContent>
          <TabsContent value="dash-feel" className="mt-6">
            <DashFeel />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>Powered by AI. Handle with fun.</p>
      </footer>
    </div>
  );
}
