// Mock implementation of @tanstack/react-query
export const useQuery = (queryKey: any, queryFn: any, options?: any) => {
  return {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

export const useMutation = (mutationFn: any, options?: any) => {
  return {
    mutate: (variables: any) => Promise.resolve(),
    mutateAsync: (variables: any) => Promise.resolve(),
    isLoading: false,
    isError: false,
    error: null,
    reset: () => {},
  };
};

export const useQueryClient = () => {
  return {
    invalidateQueries: () => Promise.resolve(),
    setQueryData: () => {},
    getQueryData: () => null,
  };
}; 