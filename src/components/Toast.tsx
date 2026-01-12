"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${
        bgColors[type]
      } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } z-50`}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 hover:bg-white/20 rounded-full p-1"
      >
        ✕
      </button>
    </div>
  );
}
