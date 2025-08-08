import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

export default function AuthPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-[100dvh] gradient-surface flex items-center justify-center p-6">
      <section className="w-full max-w-md liquid-glass-heavy rounded-3xl p-6 text-center shadow-2xl">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Continue with your Google account</p>
        <div className="mt-6">
          <GoogleLoginButton className="w-full" />
        </div>
      </section>
    </main>
  );
}
