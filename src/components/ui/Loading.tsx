import React from "react";

type LoadingVariant = "spinner" | "overlay" | "scan" | "skeleton";

interface LoadingProps {
  variant?: LoadingVariant;
  text?: string;
  className?: string;
}

export function Loading({
  variant = "spinner",
  text = "Loading...",
  className = "",
}: LoadingProps) {
  if (variant === "spinner") {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {text && <span className="text-sm font-medium">{text}</span>}
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white rounded-full p-4 shadow-lg border border-indigo-100">
            <svg
              className="w-8 h-8 text-indigo-600 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              ></path>
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 animate-pulse">
          {text}
        </h3>
      </div>
    );
  }

  if (variant === "scan") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
        {/* Document Icon */}
        <div className="relative mb-6">
          <svg
            className="w-20 h-20 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          {/* Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{text}</h3>
        <p className="text-gray-500 text-sm">Processing content...</p>
        <style jsx>{`
          @keyframes scan {
            0%,
            100% {
              top: 0%;
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            85% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className="w-full animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-100"
          >
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
