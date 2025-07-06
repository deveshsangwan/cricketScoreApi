'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ error, errorInfo });
    
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <DefaultErrorFallback 
        error={this.state.error} 
        onReset={this.handleReset} 
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onReset: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md text-center bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl"
    >
      <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-red-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
      <p className="text-slate-300 mb-6">
        We&apos;re sorry, but something unexpected happened. Our team has been notified.
      </p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-6 text-left bg-slate-900/50 rounded-lg p-4">
          <summary className="cursor-pointer text-slate-400 font-medium mb-2">
            Error Details (Development)
          </summary>
          <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-auto max-h-32">
            {error.message}
            {error.stack && '\n\nStack trace:\n' + error.stack}
          </pre>
        </details>
      )}
      
      <div className="flex gap-3 justify-center">
        <button 
          onClick={onReset}
          className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-sky-500/25 focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-600 transition-all focus:ring-2 focus:ring-slate-500/50 focus:outline-none"
        >
          Go Home
        </button>
      </div>
    </motion.div>
  </div>
);

// Hook for using error boundary in functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Manual error reported:', error, errorInfo);
    // You can integrate with error reporting services here
    // Example: reportError(error, errorInfo);
  };

  return { reportError: handleError };
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary; 