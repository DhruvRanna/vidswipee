import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("likedVideos");
      setLikesCount(saved ? JSON.parse(saved).length : 0);
    } catch {}
  }, []);

  if (!user) return <Navigate to="/auth" replace />;

  const name = useMemo(() => user.user_metadata?.name || user.email, [user]);

  return (
    <main className="min-h-[100dvh] gradient-surface p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6 rounded-3xl shadow-card">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {name}</p>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 rounded-2xl">
            <p className="text-sm text-muted-foreground">Liked Videos</p>
            <p className="text-3xl font-semibold mt-1">{likesCount}</p>
          </Card>
          <Card className="p-4 rounded-2xl">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg mt-1 break-words">{user.email}</p>
          </Card>
        </section>
      </Card>
    </main>
  );
}
