import { Creation } from '@/types/creation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download, Eye, Trash2 } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { downloadStoryboard } from '@/lib/storyboard';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CreationCardProps {
  creation: Creation;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
  onView: (creation: Creation) => void;
}

export function CreationCard({
  creation,
  onToggleFavorite,
  onDelete,
  onView,
}: CreationCardProps) {
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
    <Card className="overflow-hidden card-hover group">
      <div className="relative aspect-[2/3] bg-muted">
        <img
          src={creation.image_url}
          alt={creation.story_input}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => onView(creation)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2">{creation.story_input}</h3>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {formatDistance(new Date(creation.created_at), new Date(), {
              addSuffix: true,
            })}
          </span>
          {creation.has_captions && (
            <span className="text-xs bg-secondary px-2 py-1 rounded">
              With Captions
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={creation.is_favorite ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onToggleFavorite(creation.id, creation.is_favorite)}
          >
            <Heart
              className={`w-4 h-4 mr-2 ${
                creation.is_favorite ? 'fill-current' : ''
              }`}
            />
            {creation.is_favorite ? 'Favorited' : 'Favorite'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this creation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  storyboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(creation.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
