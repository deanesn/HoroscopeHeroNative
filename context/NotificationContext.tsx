import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  showNotification: (notification: NotificationData) => void;
  hideNotification: () => void;
  notification: NotificationData | null;
}

interface NotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onPress?: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);

  const showNotification = (notificationData: NotificationData) => {
    setNotification(notificationData);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};