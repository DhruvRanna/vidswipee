import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { SwipeInterface } from "@/components/SwipeInterface";
import { YouBuddyChat } from "@/components/YouBuddyChat";
import { NotificationSystem } from "@/components/NotificationSystem";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = (preferences: any) => {
    setUserPreferences(preferences);
    setIsOnboarded(true);
    console.log("User preferences:", preferences);
  };

  const handleOpenChat = () => {
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  const handleGoHome = () => {
    setIsOnboarded(false);
    setUserPreferences(null);
    setShowSplash(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <NotificationSystem />
      <SwipeInterface 
        preferences={userPreferences} 
        onOpenChat={handleOpenChat}
        onGoHome={handleGoHome}
      />
      <YouBuddyChat
        isOpen={showChat}
        onClose={handleCloseChat}
        preferences={userPreferences}
      />
    </>
  );
};

export default Index;
