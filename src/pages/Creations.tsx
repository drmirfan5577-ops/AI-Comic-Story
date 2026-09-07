import { useState } from 'react';
import { useCreations } from '@/hooks/useCreations';
import { CreationCard } from '@/components/creations/CreationCard';
import { StoryboardViewer } from '@/components/creations/StoryboardViewer';
import { Creation } from '@/types/creation';
import { Loader2, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Creations() {
  const { creations, isLoading, toggleFavorite, deleteCreation } = useCreations();
  const [viewingCreation, setViewingCreation] = useState<Creation | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const displayedCreations = showOnlyFavorites
    ? creations.filter((c) => c.is_favorite)
    : creations;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-background dark:via-background dark:to-background">
      <div className="container py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              My Creations
            </h1>
            <p className="text-muted-foreground">
              {displayedCreations.length} storyboard{displayedCreations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Button
            variant={showOnlyFavorites ? 'default' : 'outline'}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className="gap-2"
          >
            <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            Favorites Only
          </Button>
        </div>

        {displayedCreations.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">
              {showOnlyFavorites ? 'No favorites yet' : 'No creations yet'}
            </h2>
            <p className="text-muted-foreground">
              {showOnlyFavorites
                ? 'Mark your favorite storyboards to see them here'
                : 'Start creating magical storyboards!'}
            </p>
            {!showOnlyFavorites && (
              <Link to="/">
                <Button className="btn-magic">Create Your First Storyboard</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCreations.map((creation) => (
              <CreationCard
                key={creation.id}
                creation={creation}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteCreation}
                onView={setViewingCreation}
              />
            ))}
          </div>
        )}

        <StoryboardViewer
          creation={viewingCreation}
          onClose={() => setViewingCreation(null)}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </div>
  );
}
