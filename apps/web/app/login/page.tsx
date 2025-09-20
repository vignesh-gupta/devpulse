import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            DevPulse
          </h1>
          <p className="text-gray-600">
            Your AI-powered daily standup assistant
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
