import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

const notificationIcons = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

const notificationStyles = {
  success: 'liquid-glass border-green-500/30 shadow-[0_0_20px_hsl(120_70%_50%/0.3)]',
  error: 'liquid-glass border-red-500/30 shadow-[0_0_20px_hsl(0_70%_50%/0.3)]',
  info: 'liquid-glass border-blue-500/30 shadow-[0_0_20px_hsl(200_70%_50%/0.3)]',
  warning: 'liquid-glass border-yellow-500/30 shadow-[0_0_20px_hsl(45_70%_50%/0.3)]',
};

export const showNotification = (notification: Omit<NotificationProps, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`max-w-sm w-full rounded-2xl p-4 ${notificationStyles[notification.type]}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-500/20' :
                notification.type === 'error' ? 'bg-red-500/20' :
                notification.type === 'info' ? 'bg-blue-500/20' :
                'bg-yellow-500/20'
              }`}>
                {React.createElement(notificationIcons[notification.type], {
                  className: `w-4 h-4 ${
                    notification.type === 'success' ? 'text-green-400' :
                    notification.type === 'error' ? 'text-red-400' :
                    notification.type === 'info' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`
                })}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/10"
                onClick={() => toast.dismiss(t.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    {
      duration: notification.duration || 4000,
      position: 'top-right',
      id
    }
  );
};

export const NotificationSystem = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 80,
        right: 20,
      }}
    />
  );
};

// Predefined notification helpers
export const notifications = {
  success: (title: string, message: string) => 
    showNotification({ type: 'success', title, message }),
  
  error: (title: string, message: string) => 
    showNotification({ type: 'error', title, message }),
  
  info: (title: string, message: string) => 
    showNotification({ type: 'info', title, message }),
  
  warning: (title: string, message: string) => 
    showNotification({ type: 'warning', title, message }),
};