import { Creation } from '@/types/creation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Heart, X } from 'lucide-react';
import { downloadStoryboard } from '@/lib/storyboard';
import { toast } from 'sonner';

interface StoryboardViewerProps {
  creation: Creation | null;
  onClose: () => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export function StoryboardViewer({
  creation,
  onClose,
  onToggleFavorite,
}: StoryboardViewerProps) {
  if (!creation) return null;

  const handleDownload = async () => {
    try {
      await downloadStoryboard(creation.image_url, creation.story_input);
      toast.success('Downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  return (
    <Dialog open={!!creation} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{creation.story_input}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <img
            src={creation.image_url}
            alt={creation.story_input}
            className="w-full rounded-lg shadow-lg"
          />

          <div className="flex gap-2">
            <Button
              variant={creation.is_favorite ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onToggleFavorite(creation.id, creation.is_favorite)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  creation.is_favorite ? 'fill-current' : ''
                }`}
              />
              {creation.is_favorite ? 'Favorited' : 'Add to Favorites'}
            </Button>

            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
