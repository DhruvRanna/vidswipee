import { AnimatePresence, motion } from "framer-motion";
import GoogleLoginButton from "./GoogleLoginButton";

export default function GoogleLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md liquid-glass-heavy rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Sign in to continue</h3>
            <p className="text-sm text-muted-foreground">
              Create your profile, sync likes, and get personalized picks.
            </p>
            <div className="pt-2">
              <GoogleLoginButton className="w-full" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
