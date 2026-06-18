import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Database } from '../types';

type ClinicSettings = Database['public']['Tables']['clinic_settings']['Row'];

interface SettingsContextType {
  settings: ClinicSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Mocking settings data to prevent loading lockup with placeholder URLs
      setSettings(null);
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
