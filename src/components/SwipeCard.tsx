import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { Heart, X, Play, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";

interface VideoData {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  views: string;
  highlights: string[];
}

interface SwipeCardProps {
  video: VideoData;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap: () => void;
}

export const SwipeCard = ({ video, onSwipe, onTap }: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Determine aspect ratio based on video type
  const durationToSeconds = (d: string) => {
    try {
      if (!d) return 0;
      const parts = d.split(':').map((p) => parseInt(p, 10));
      if (parts.some((n) => Number.isNaN(n))) return 0;
      let sec = 0;
      for (const n of parts) sec = sec * 60 + n;
      return sec;
    } catch {
      return 0;
    }
  };
  const isShort = (() => {
    const secs = durationToSeconds(video.duration);
    const t = (video.title || '').toLowerCase();
    return (secs > 0 && secs <= 70) || t.includes('short');
  })();
  const aspectClass = isShort ? 'aspect-[9/16]' : 'aspect-video';

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (Math.abs(velocity) >= 400 || Math.abs(offset) >= 120) {
      setExitX(offset > 0 ? 1000 : -1000);
      onSwipe(offset > 0 ? 'right' : 'left');
    } else {
      x.set(0);
    }
  };

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoPlayerOpen(false);
  };

  const handleSwipeAction = (direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    setExitX(direction === 'right' ? 1000 : -1000);
    onSwipe(direction);
  };

  return (
    <>
      <motion.div
        className="absolute inset-2 sm:inset-4 rounded-3xl overflow-hidden shadow-card bg-black cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={exitX ? { x: exitX } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={onTap}
      >
      {/* 16:9 Thumbnail */}
      <div className="relative h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-6">
          <div className={`w-full max-w-5xl ${aspectClass} rounded-2xl overflow-hidden shadow-card`}>
            <img
              src={video.thumbnail}
              alt={`Thumbnail of ${video.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 pb-24 sm:pb-28 text-white">
          {/* Video Info */}
          <div className="space-y-4">
            {/* Channel & Stats */}
            <div className="flex items-center justify-between text-xs sm:text-sm opacity-80">
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{video.channel}</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 sm:line-clamp-3">
              {video.title}
            </h2>

            {/* Highlights */}
            <div className="space-y-1 sm:space-y-2 max-h-16 sm:max-h-24 overflow-hidden">
              {video.highlights.slice(0, 2).map((highlight, index) => (
                <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                  <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="opacity-90 line-clamp-1">{highlight}</span>
                </div>
              ))}
            </div>

            {/* Action Button - Bottom Center */}
            <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-auto" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
              <Button 
                variant="ghost" 
                size="lg"
                className="liquid-glass h-16 w-16 sm:h-20 sm:w-20 rounded-full transition-all duration-200 active:scale-95"
                onClick={handlePlayVideo}
                aria-label="Play video"
              >
                <Play className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
        {/* Swipe Indicators */}
        <motion.div 
          className="absolute top-1/2 left-4 sm:left-8 -translate-y-1/2 bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-bold text-sm sm:text-lg rotate-12 shadow-lg"
          style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
        >
          NOPE
        </motion.div>
      </motion.div>

      {/* Video Player Modal */}
      <VideoPlayer
        videoId={video.id}
        title={video.title}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideo}
        onBackToSwipe={handleCloseVideo}
      />
    </>
  );
};