import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Creation } from '@/types/creation';
import { toast } from 'sonner';
import { getLocalCreations, updateLocalCreation, deleteLocalCreation } from '@/lib/storyboard';

export function useCreations() {
  const queryClient = useQueryClient();

  const { data: creations = [], isLoading } = useQuery({
    queryKey: ['creations'],
    queryFn: async () => {
      return getLocalCreations();
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      updateLocalCreation(id, { is_favorite: !isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creations'] });
      toast.success('Updated favorite status');
    },
    onError: (error) => {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    },
  });

  const deleteCreationMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteLocalCreation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creations'] });
      toast.success('Creation deleted');
    },
    onError: (error) => {
      console.error('Failed to delete creation:', error);
      toast.error('Failed to delete creation');
    },
  });

  return {
    creations,
    isLoading,
    toggleFavorite: toggleFavoriteMutation.mutate,
    deleteCreation: deleteCreationMutation.mutate,
  };
}
