import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  readingSpeed: 'slow' | 'medium' | 'fast';
  textToSpeech: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface SettingsContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  readingSpeed: 'medium',
  textToSpeech: false,
  fontSize: 'medium',
  notifications: {
    email: true,
    push: true,
    inApp: true
  }
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences));
        }
      } catch (e) {
        console.error('Failed to load preferences', e);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const value = {
    preferences,
    updatePreferences,
    resetPreferences
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};