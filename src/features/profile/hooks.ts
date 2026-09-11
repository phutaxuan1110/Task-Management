import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queryClient'
import { reportError } from '@/lib/errors'
import { useUserId } from '@/features/auth/AuthProvider'
import { fetchProfile, upsertProfile } from '@/features/profile/api'

export function useProfile() {
  const userId = useUserId()
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => fetchProfile(userId),
    enabled: Boolean(userId),
  })
}

export function useUpdateProfile() {
  const userId = useUserId()
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ displayName, timezone }: { displayName: string; timezone: string }) =>
      upsertProfile(userId, { display_name: displayName, timezone }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.profile(userId) })
      toast.success('Profile saved')
    },
    onError: (error) => reportError(error, 'The profile could not be saved.'),
  })
}
