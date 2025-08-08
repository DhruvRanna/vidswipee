import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function GoogleLoginButton({ className = "" }: { className?: string }) {
  const { signInWithGoogle } = useAuth();

  return (
    <Button onClick={signInWithGoogle} className={`gradient-primary shadow-glow ${className}`}>
      <GoogleIcon className="w-4 h-4 mr-2" />
      Continue with Google
    </Button>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.6 0 9.2-4.6 9.2-7 0-.5-.1-.9-.1-1.2H12z"/>
    </svg>
  );
}
