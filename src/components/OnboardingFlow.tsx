import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const CATEGORIES = [
  "Tech & AI", "Business", "Motivation", "Comedy", "Finance", 
  "K-pop", "Gaming", "Cooking", "Travel", "Fitness",
  "Art & Design", "Science", "Music", "Sports", "Fashion"
];

const VIDEO_LENGTHS = [
  { id: "shorts", label: "Shorts (<1 min)", emoji: "⚡" },
  { id: "short", label: "Short (3-5 mins)", emoji: "🎯" },
  { id: "medium", label: "Medium (10+ mins)", emoji: "📚" },
  { id: "long", label: "Long (30+ mins)", emoji: "🎬" }
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Hindi", 
  "Japanese", "Korean", "Chinese", "Portuguese", "Arabic"
];

const MOODS = [
  { id: "inspired", label: "Inspired", emoji: "✨", color: "bg-yellow-500/20 border-yellow-500/30" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "bg-blue-500/20 border-blue-500/30" },
  { id: "relaxed", label: "Relaxed", emoji: "😌", color: "bg-green-500/20 border-green-500/30" },
  { id: "creative", label: "Creative", emoji: "🎨", color: "bg-purple-500/20 border-purple-500/30" }
];

interface OnboardingFlowProps {
  onComplete: (preferences: any) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    customTopics: "",
    videoLengths: [] as string[],
    languages: [] as string[],
    mood: ""
  });

  const steps = [
    {
      title: "What interests you?",
      subtitle: "Select categories you love watching",
      component: (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={preferences.categories.includes(category) ? "default" : "outline"}
              className={`h-auto p-4 justify-start transition-all duration-300 ${
                preferences.categories.includes(category) 
                  ? "gradient-primary shadow-glow-primary" 
                  : "liquid-glass hover:border-accent/50 hover:shadow-glow-accent"
              }`}
              onClick={() => {
                setPreferences(prev => ({
                  ...prev,
                  categories: prev.categories.includes(category)
                    ? []
                    : [category]
                }));
              }}
            >
              {category}
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "Any specific topics?",
      subtitle: "Tell us what you want to learn about",
      component: (
        <div className="space-y-4">
          <Input
            placeholder="e.g., 'How to start freelancing', 'AI in healthcare'"
            value={preferences.customTopics}
            onChange={(e) => setPreferences(prev => ({ ...prev, customTopics: e.target.value }))}
            className="glass-morphism border-accent/30 text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground text-center">
            Our AI will find videos matching your interests
          </p>
        </div>
      )
    },
    {
      title: "Preferred video length?",
      subtitle: "How much time do you usually have?",
      component: (
        <div className="space-y-3">
          {VIDEO_LENGTHS.map((length) => (
            <Button
              key={length.id}
              variant={preferences.videoLengths.includes(length.id) ? "default" : "outline"}
              className={`w-full h-auto p-4 justify-start ${
                preferences.videoLengths.includes(length.id)
                  ? "gradient-primary shadow-glow"
                  : "glass-morphism hover:border-accent/50"
              }`}
              onClick={() => {
                setPreferences(prev => ({
                  ...prev,
                  videoLengths: prev.videoLengths.includes(length.id)
                    ? []
                    : [length.id]
                }));
              }}
            >
              <span className="text-xl mr-3">{length.emoji}</span>
              {length.label}
            </Button>
          ))}
        </div>
      )
    },
    {
      title: "Language preferences?",
      subtitle: "Which languages do you understand?",
      component: (
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((language) => (
            <Button
              key={language}
              variant={preferences.languages.includes(language) ? "default" : "outline"}
              className={`h-auto p-3 ${
                preferences.languages.includes(language)
                  ? "gradient-primary shadow-glow"
                  : "glass-morphism hover:border-accent/50"
              }`}
              onClick={() => {
                setPreferences(prev => ({
                  ...prev,
                  languages: prev.languages.includes(language)
                    ? prev.languages.filter(l => l !== language)
                    : [...prev.languages, language]
                }));
              }}
            >
              {language}
            </Button>
          ))}
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return preferences.categories.length > 0;
      case 1: return true; // Optional step
      case 2: return preferences.videoLengths.length > 0;
      case 3: return preferences.languages.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-[100dvh] gradient-surface flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-accent animate-float" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            VidSwipe
          </h1>
        </div>
        <p className="text-muted-foreground">AI-powered video discovery</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="w-full bg-secondary rounded-full h-2 liquid-glass">
          <div 
            className="gradient-primary h-2 rounded-full transition-all duration-500 shadow-glow-primary"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Step {currentStep + 1}</span>
          <span>{steps.length} steps</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
            
            <div className="pb-2">
              {steps[currentStep].component}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 left-0 right-0 z-30 p-4 sm:p-6 safe-area-bottom flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="glass-morphism border-accent/30 min-w-[80px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2 px-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index <= currentStep ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={() => onComplete(preferences)}
            disabled={!canProceed()}
            className="gradient-primary shadow-glow min-w-[120px]"
          >
            Start Swiping
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={!canProceed()}
            className="gradient-primary shadow-glow min-w-[80px]"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};