import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, Maximize, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onBackToSwipe?: () => void;
}

export const VideoPlayer = ({ videoId, title, isOpen, onClose, onBackToSwipe }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setShowControls(true);
      
      // Hide controls after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setIsPlaying(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const toggleControls = () => {
    setShowControls(!showControls);
    
    if (!showControls) {
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Note: Direct iframe control is limited, but we can update the UI state
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
        onClick={toggleControls}
      >
        {/* Video Player */}
        <div className="relative w-full h-full flex items-center justify-center">
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3&fs=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          
          {/* Minimal Top Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {onBackToSwipe && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBackToSwipe();
                        }}
                        className="liquid-glass text-white hover:bg-white/20 rounded-xl"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="liquid-glass text-white hover:bg-white/20 rounded-xl"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                  
                  <div className="liquid-glass px-3 py-1 rounded-xl">
                    <h3 className="text-white text-sm font-medium line-clamp-1 max-w-[200px]">
                      {title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};