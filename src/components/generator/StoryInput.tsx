import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StoryInputProps {
  onGenerate: (storyInput: string, hasCaptions: boolean) => void;
  isGenerating: boolean;
}

export function StoryInput({ onGenerate, isGenerating }: StoryInputProps) {
  const [storyInput, setStoryInput] = useState('');
  const [hasCaptions, setHasCaptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storyInput.trim().length >= 5) {
      onGenerate(storyInput, hasCaptions);
    }
  };

  const isValid = storyInput.trim().length >= 5 && storyInput.length <= 300;

  return (
    <Card className="p-8 bg-card shadow-xl animate-bounce-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="story" className="text-lg font-semibold">
            What story would you like to create?
          </Label>
          <Textarea
            id="story"
            placeholder="Enter a story title or description... (e.g., 'The Fox and the Grapes' or 'A brave little mouse goes on an adventure')"
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            className="min-h-[120px] text-lg resize-none"
            maxLength={300}
            disabled={isGenerating}
          />
          <p className="text-sm text-muted-foreground">
            {storyInput.length}/300 characters
            {storyInput.length < 5 && storyInput.length > 0 && (
              <span className="text-destructive ml-2">
                (minimum 5 characters)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="captions" className="text-base font-medium">
              Add text captions
            </Label>
            <p className="text-sm text-muted-foreground">
              Display scene descriptions on each panel
            </p>
          </div>
          <Switch
            id="captions"
            checked={hasCaptions}
            onCheckedChange={setHasCaptions}
            disabled={isGenerating}
          />
        </div>

        <Button
          type="submit"
          disabled={!isValid || isGenerating}
          className="w-full btn-magic text-lg h-14"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Magic...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Storyboard
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
