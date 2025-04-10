import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred";
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {statusCode === 404 ? "Page Not Found" : "Something went wrong"}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {errorMessage}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => {
            navigate(-1);
          }}
          variant="outline"
        >
          Go Back
        </Button>
        <Button
          onClick={() => {
            navigate("/");
          }}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
