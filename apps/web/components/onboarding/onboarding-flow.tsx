"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ onNext: () => void; onSkip?: () => void }>;
}

// Welcome Step Component
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to DevPulse!
      </h2>
      <p className="text-gray-600 mb-6">
        Let's get you set up to start generating AI-powered daily standup summaries
        from your GitHub activity.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          What you'll accomplish:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Connect your GitHub account</li>
          <li>• Select repositories to track</li>
          <li>• Generate your first AI summary</li>
        </ul>
      </div>
      <button
        onClick={onNext}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Get Started
      </button>
    </div>
  );
}

// GitHub Connection Step
function GitHubConnectionStep({ onNext }: { onNext: () => void }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Sign in with GitHub - the session check will happen after redirect
      onNext();

      // Sign in with GitHub
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/onboarding?step=2",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to GitHub");
      setIsConnecting(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-900 mb-4">
        <svg
          className="h-6 w-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Connect GitHub
      </h2>
      <p className="text-gray-600 mb-6">
        Connect your GitHub account to allow DevPulse to access your repositories
        and generate summaries from your activity.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          We'll access:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your public repositories</li>
          <li>• Commit history and activity</li>
          <li>• Pull requests and issues</li>
        </ul>
      </div>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? "Connecting..." : "Connect with GitHub"}
      </button>
    </div>
  );
}

// Completion Step
function CompletionStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        You're all set!
      </h2>
      <p className="text-gray-600 mb-6">
        Your GitHub account is connected. You can now start managing your
        repositories and generating AI-powered summaries.
      </p>
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-green-900 mb-2">
          Next steps:
        </h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Go to your dashboard</li>
          <li>• Connect specific repositories</li>
          <li>• Generate your first summary</li>
        </ul>
      </div>
      <button
        onClick={onNext}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

// Main Onboarding Component
export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session, isPending } = authClient.useSession();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome",
      description: "Introduction to DevPulse",
      component: WelcomeStep,
    },
    {
      id: "github",
      title: "GitHub Connection",
      description: "Connect your GitHub account",
      component: GitHubConnectionStep,
    },
    {
      id: "complete",
      title: "Complete",
      description: "Setup complete",
      component: CompletionStep,
    },
  ];

  // Check if user is already authenticated and skip to appropriate step
  useEffect(() => {
    if (!isPending && session?.user) {
      if (currentStep === 0) {
        setCurrentStep(1); // Skip welcome if already authenticated
      }
    }
  }, [session, isPending, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete and redirect to dashboard
      localStorage.setItem("devpulse-onboarding-complete", "true");
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("devpulse-onboarding-complete", "true");
    router.push("/dashboard");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep]?.component;

  if (!CurrentStepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid step</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-2 text-blue-600 hover:text-blue-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DevPulse</h1>
          <p className="mt-2 text-sm text-gray-600">AI-Powered Daily Standup Assistant</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <CurrentStepComponent onNext={handleNext} onSkip={handleSkip} />
        </div>

        {/* Skip Link */}
        {currentStep < steps.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip setup for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}