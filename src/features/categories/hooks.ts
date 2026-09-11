import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queryClient'
import { reportError } from '@/lib/errors'
import { useUserId } from '@/features/auth/AuthProvider'
import { deleteCategory, fetchCategories, insertCategory, updateCategory } from '@/features/categories/api'

export function useCategories() {
  const userId = useUserId()
  return useQuery({
    queryKey: queryKeys.categories(userId),
    queryFn: () => fetchCategories(userId),
    enabled: Boolean(userId),
  })
}

export function useCreateCategory() {
  const userId = useUserId()
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => insertCategory(userId, name, color),
    onSuccess: (category) => {
      client.invalidateQueries({ queryKey: queryKeys.categories(userId) })
      toast.success('Category created', { description: category.name })
    },
    onError: (error) => reportError(error, 'The category could not be created.'),
  })
}

export function useUpdateCategory() {
  const userId = useUserId()
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, color }: { id: string; name?: string; color?: string }) =>
      updateCategory(id, { name, color }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.categories(userId) })
      toast.success('Category updated')
    },
    onError: (error) => reportError(error, 'The category could not be updated.'),
  })
}

/** Tasks survive: the FK is ON DELETE SET NULL, so they become uncategorised. */
export function useDeleteCategory() {
  const userId = useUserId()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.categories(userId) })
      client.invalidateQueries({ queryKey: queryKeys.tasks(userId) })
      toast.success('Category deleted', { description: 'Its tasks are now uncategorised.' })
    },
    onError: (error) => reportError(error, 'The category could not be deleted.'),
  })
}
