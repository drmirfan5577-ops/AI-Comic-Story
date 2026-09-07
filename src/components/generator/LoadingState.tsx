import { Card } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

export function LoadingState() {
  return (
    <Card className="p-12 bg-gradient-magic text-white shadow-2xl animate-bounce-in">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin" />
          <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Creating Your Story...</h3>
          <p className="text-white/80">
            Our AI is crafting 12 beautiful scenes for your storyboard
          </p>
        </div>

        <div className="w-full max-w-md space-y-3">
          <LoadingStep step={1} text="Generating story scenes..." />
          <LoadingStep step={2} text="Drawing illustrations..." />
          <LoadingStep step={3} text="Composing storyboard..." />
        </div>
      </div>
    </Card>
  );
}

function LoadingStep({ step, text }: { step: number; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/90">
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold backdrop-blur">
        {step}
      </div>
      <span>{text}</span>
    </div>
  );
}
