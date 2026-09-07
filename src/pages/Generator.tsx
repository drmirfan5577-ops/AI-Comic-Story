import { useState } from 'react';
import { StoryInput } from '@/components/generator/StoryInput';
import { LoadingState } from '@/components/generator/LoadingState';
import { generateStoryboard, saveCreation, downloadStoryboard } from '@/lib/storyboard';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BookOpen } from 'lucide-react';

export function Generator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<string>('');
  const navigate = useNavigate();

  const handleGenerate = async (storyInput: string, hasCaptions: boolean) => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setCurrentStory(storyInput);

    try {
      console.log('Starting storyboard generation...');
      const result = await generateStoryboard(storyInput, hasCaptions);
      
      console.log('Saving to browser storage...');
      await saveCreation(
        storyInput,
        hasCaptions,
        result.imageUrl,
        result.sceneDescriptions
      );

      setGeneratedImageUrl(result.imageUrl);
      
      toast.success('Storyboard created successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate storyboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (generatedImageUrl) {
      try {
        await downloadStoryboard(generatedImageUrl, currentStory);
        toast.success('Downloaded successfully');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-background dark:via-background dark:to-background">
      <div className="container py-12 space-y-8">
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text">
            Create Magical Storyboards
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your story ideas into beautiful illustrated storyboards with AI
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {!isGenerating && !generatedImageUrl && (
            <StoryInput onGenerate={handleGenerate} isGenerating={false} />
          )}

          {isGenerating && <LoadingState />}

          {generatedImageUrl && (
            <Card className="p-6 space-y-6 animate-bounce-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Your Storyboard is Ready! 🎉</h2>
                <p className="text-muted-foreground">{currentStory}</p>
              </div>

              <img
                src={generatedImageUrl}
                alt="Generated storyboard"
                className="w-full rounded-lg shadow-xl"
              />

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate('/creations')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View All Creations
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setGeneratedImageUrl(null);
                  setCurrentStory('');
                }}
              >
                Create Another Storyboard
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
