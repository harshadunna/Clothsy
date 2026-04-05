import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F0EA] text-[#1C1C1A] font-[Manrope]">
          <h2 className="text-3xl font-[Newsreader] italic mb-4">Something went wrong.</h2>
          <p className="text-gray-600 mb-8 uppercase tracking-widest text-sm">Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-[#1C1C1A] text-white uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
