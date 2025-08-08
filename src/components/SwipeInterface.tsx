import { useState, useEffect } from "react";
import { SwipeCard } from "./SwipeCard";
import { Button } from "@/components/ui/button";
import { MessageCircle, Settings, RefreshCw, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LogoText } from "./Logo";
import { notifications } from "./NotificationSystem";
import { SettingsPopup } from "./SettingsPopup";
import GoogleLoginModal from "./GoogleLoginModal";
import { useAuth } from "@/hooks/use-auth";
interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  views: string;
  highlights: string[];
  description?: string;
}

interface SwipeInterfaceProps {
  preferences: any;
  onOpenChat: () => void;
  onGoHome?: () => void;
}

export const SwipeInterface = ({ preferences, onOpenChat, onGoHome }: SwipeInterfaceProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [shownVideoIds, setShownVideoIds] = useState<Set<string>>(new Set());
  const [currentSearchPage, setCurrentSearchPage] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPromptShown, setLoginPromptShown] = useState(false);
  const { user } = useAuth();

const handleSwipe = (direction: 'left' | 'right') => {
  const video = videos[currentIndex];
  console.log(`Swiped ${direction} on video:`, video.title);
  
  // Show notification
  if (direction === 'left') {
    notifications.info('Skipped', 'Video skipped successfully');
  } else {
    notifications.success('Liked', 'Video added to your likes');
    
    // Save liked video to localStorage
    const savedLikes = localStorage.getItem('likedVideos');
    const likedVideos = savedLikes ? JSON.parse(savedLikes) : [];
    const newLikedVideos = [...likedVideos, video];
    localStorage.setItem('likedVideos', JSON.stringify(newLikedVideos));
  }
  
  // Increment swipe count and maybe show login
  const nextCount = swipeCount + 1;
  setSwipeCount(nextCount);
  if (!user && !loginPromptShown && nextCount >= 2) {
    setShowLoginModal(true);
    setLoginPromptShown(true);
  }
  
  // Move to next video
  setCurrentIndex(prev => prev + 1);
  
  // Load more videos when running low (infinite scrolling)
  if (currentIndex >= videos.length - 5) {
    loadMoreVideos();
  }
};

  const handleTap = () => {
    const video = videos[currentIndex];
    console.log("Tapped video:", video.title);
    // Video will now play inline instead of opening YouTube
  };

  const searchVideos = async (searchQuery?: string, isLoadMore: boolean = false) => {
    setIsLoading(true);
    try {
      let query = searchQuery;
      if (!query) {
        // Build query from preferences
        const categoryTerms = Array.isArray(preferences?.categories)
          ? preferences.categories.join(' ')
          : (preferences?.categories || '');
        const customTerms = preferences?.customTopics || '';
        const moodTerms = preferences?.mood || '';
        const lengthId = Array.isArray(preferences?.videoLengths)
          ? preferences.videoLengths[0]
          : preferences?.videoLengths;
        const lengthTermsMap: Record<string, string> = {
          shorts: 'shorts',
          short: 'short video 3-5 minutes',
          medium: '10+ minutes video',
          long: '30+ minutes long video',
        };
        const lengthTerms = lengthId ? (lengthTermsMap as any)[lengthId] || '' : '';
        const languageTerms = Array.isArray(preferences?.languages)
          ? preferences.languages.join(' ')
          : (preferences?.languages || '');
        query = `${categoryTerms} ${customTerms} ${moodTerms} ${lengthTerms} ${languageTerms}`.trim() || 'trending';
      }

      // Add random search terms to get diverse results
      const searchVariations = [
        'latest', 'best', 'top', 'new', 'trending', 'popular', 'viral', 'amazing', 'awesome', 'must watch',
        '2024', '2023', 'recent', 'tutorial', 'guide', 'tips', 'review', 'explained', 'how to'
      ];
      
      const randomVariation = searchVariations[Math.floor(Math.random() * searchVariations.length)];
      const searchWithVariation = `${query} ${randomVariation}`;

      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { 
          query: isLoadMore ? searchWithVariation : query,
          preferences,
          maxResults: 50,
          pageToken: isLoadMore ? `page_${currentSearchPage}` : undefined
        }
      });

      if (error) {
        console.error('Error fetching videos:', error);
        notifications.error('Search failed', 'Could not fetch videos. Please try again.');
        return;
      }

      // Normalize response shape from Edge Function (preferred) or raw YouTube payload (fallback)
      const raw = data as any;
      const fromFunction = Array.isArray(raw?.videos) ? raw.videos : [];
      const fromRawItems = Array.isArray(raw?.items)
        ? raw.items.map((item: any) => ({
            id: item.id?.videoId ?? item.id,
            title: item.snippet?.title ?? 'Untitled',
            channel: item.snippet?.channelTitle ?? 'Unknown channel',
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
            duration: '-', // not available in raw search payload
            views: '-',    // not available in raw search payload
            description: item.snippet?.description ?? ''
          }))
        : [];

      const sourceVideos = (fromFunction.length ? fromFunction : fromRawItems) as any[];

      if (!sourceVideos.length) {
        console.warn('No videos returned for query:', query);
        if (!isLoadMore) {
          notifications.info('No videos found', 'Try changing your preferences or search terms.');
        }
      }

      // Filter out already shown videos to prevent duplicates
      const newVideos = sourceVideos.filter((v: any) => v?.id && !shownVideoIds.has(v.id));

      const videosWithHighlights = await Promise.all(
        newVideos.map(async (video: any) => {
          try {
            const highlightsResponse = await supabase.functions.invoke('ai-highlights', {
              body: {
                title: video.title,
                description: video.description,
                channel: video.channel
              }
            });
            return {
              ...video,
              highlights: highlightsResponse.data?.highlights || [
                "Discover key insights from industry experts",
                "Learn practical tips you can apply immediately",
                "Get behind-the-scenes knowledge and strategies"
              ]
            };
          } catch (highlightError) {
            console.error('Error generating highlights:', highlightError);
            return {
              ...video,
              highlights: [
                "Discover key insights from industry experts",
                "Learn practical tips you can apply immediately",
                "Get behind-the-scenes knowledge and strategies"
              ]
            };
          }
        })
      );

      // Update shown video IDs
      const newVideoIds = new Set([...shownVideoIds, ...videosWithHighlights.map((v: any) => v.id)]);
      setShownVideoIds(newVideoIds);

      setVideos(prev => [...prev, ...videosWithHighlights]);
      
      if (isLoadMore) {
        setCurrentSearchPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in searchVideos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVideos = () => {
    searchVideos(undefined, true);
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setVideos([]);
    setShownVideoIds(new Set());
    setCurrentSearchPage(0);
    searchVideos();
  };

  // Load initial videos on component mount
  useEffect(() => {
    searchVideos();
  }, [preferences]);

  if (!isLoading && videos.length > 0 && currentIndex >= videos.length) {
    return (
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold">You've seen all videos!</h2>
          <p className="text-muted-foreground">
            Great job! Our AI is learning your preferences.
          </p>
          <Button 
            onClick={resetCards}
            className="gradient-primary shadow-glow"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Show More Videos
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-surface relative overflow-hidden touch-pan-y">
      {/* Header with separated buttons */}
      <div className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 safe-area-top pointer-events-none">
        <div className="flex items-center justify-between w-full">
          {/* Back button - top left */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="liquid-glass-heavy h-11 w-11 sm:h-12 sm:w-12 rounded-2xl hover:shadow-glow-accent transition-all duration-300 pointer-events-auto"
            onClick={() => onGoHome?.()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {/* Settings and Chat buttons - top right */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="liquid-glass-heavy h-11 w-11 sm:h-12 sm:w-12 rounded-2xl hover:shadow-glow-accent transition-all duration-300"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="liquid-glass-heavy h-11 w-11 sm:h-12 sm:w-12 rounded-2xl hover:shadow-glow-accent transition-all duration-300"
              onClick={onOpenChat}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-[100dvh]">
        <AnimatePresence>
          {videos.slice(currentIndex, currentIndex + 3).map((video, index) => (
            <motion.div
              key={video.id}
              className="absolute inset-0"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1 - (index * 0.05), 
                opacity: 1 - (index * 0.3),
                y: index * 10,
                zIndex: 10 - index
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ 
                zIndex: 10 - index
              }}
            >
              {index === 0 && (
                <SwipeCard
                  video={video}
                  onSwipe={handleSwipe}
                  onTap={handleTap}
                />
              )}
              {index > 0 && (
                <div 
                  className="absolute inset-4 rounded-3xl shadow-card opacity-60"
                  style={{
                    backgroundImage: `url(${video.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/60 rounded-3xl" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
          <div className="liquid-glass px-6 py-3 rounded-2xl flex items-center gap-3 shadow-float">
            <RefreshCw className="w-4 h-4 animate-spin text-accent" />
            <span className="text-sm font-medium">Finding more videos...</span>
          </div>
        </div>
      )}

      {/* Swipe Hints */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center px-4" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="liquid-glass px-4 py-2 rounded-xl">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Swipe left to skip • Tap play to watch
          </p>
        </div>
      </div>

{/* Settings Popup */}
      <SettingsPopup
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onGoHome={() => onGoHome?.()}
      />

      {/* Google Login Modal after 2 swipes */}
      <GoogleLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};