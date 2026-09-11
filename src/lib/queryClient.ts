import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
})

export const queryKeys = {
  tasks: (userId: string) => ['tasks', userId] as const,
  task: (taskId: string) => ['task', taskId] as const,
  subtasks: (taskId: string) => ['subtasks', taskId] as const,
  categories: (userId: string) => ['categories', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,
}
