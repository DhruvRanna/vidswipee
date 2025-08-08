import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Home, ChevronRight, ArrowLeft, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  views: string;
}

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
}

export const SettingsPopup = ({ isOpen, onClose, onGoHome }: SettingsPopupProps) => {
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
const [showHistory, setShowHistory] = useState(false);

  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load liked videos from localStorage
    const savedLikes = localStorage.getItem('likedVideos');
    if (savedLikes) {
      try {
        setLikedVideos(JSON.parse(savedLikes));
      } catch (error) {
        console.error('Error loading liked videos:', error);
      }
    }
  }, [isOpen]);

  const handleGoHome = () => {
    onGoHome();
    onClose();
  };

  const handleRemove = (id: string) => {
    const updated = likedVideos.filter((v) => v.id !== id);
    setLikedVideos(updated);
    try {
      localStorage.setItem('likedVideos', JSON.stringify(updated));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-card rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {!showHistory ? (
            // Main Settings Menu
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-accent/50"
                  onClick={() => setShowHistory(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Liked Videos</p>
                      <p className="text-sm text-muted-foreground">
                        {likedVideos.length} videos saved
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>

                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-accent/50"
                    onClick={() => { navigate('/dashboard'); onClose(); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-xl">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">User Dashboard</p>
                        <p className="text-sm text-muted-foreground">View your profile and stats</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-accent/50"
                    onClick={signInWithGoogle}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-xl">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Continue with Google</p>
                        <p className="text-sm text-muted-foreground">Sign in to sync your activity</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-accent/50"
                  onClick={handleGoHome}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Back to Home</p>
                      <p className="text-sm text-muted-foreground">
                        Update your preferences
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </>
          ) : (
            // Liked Videos History
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistory(false)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-bold">Liked Videos</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {likedVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No liked videos yet</p>
                    <p className="text-sm text-muted-foreground">
                      Swipe right on videos you like!
                    </p>
                  </div>
                ) : (
                  likedVideos.map((video) => (
                    <Card key={video.id} className="p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex gap-3 items-center">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 rounded-lg object-cover bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1">
                            {video.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {video.channel} • {video.views}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(video.id)}
                          aria-label="Remove from likes"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};