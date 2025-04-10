import { Battery } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Battery className="h-8 w-8 text-primary-500 animate-pulse" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
    </div>
  );
}
