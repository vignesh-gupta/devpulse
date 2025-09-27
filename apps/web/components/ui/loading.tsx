import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "green" | "red";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  color = "blue", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const colorClasses = {
    blue: "border-blue-600",
    gray: "border-gray-600",
    green: "border-green-600", 
    red: "border-red-600"
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}

interface LoadingPageProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingPage({ 
  message = "Loading...", 
  size = "lg" 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = "" }: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ 
  lines = 3, 
  className = "" 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}