import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-4">
              We're having trouble connecting to our services. Please try again
              later.
            </p>
            <div className="bg-gray-700 p-4 rounded mb-4 overflow-auto max-h-32">
              <p className="text-sm text-gray-300 font-mono">
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
