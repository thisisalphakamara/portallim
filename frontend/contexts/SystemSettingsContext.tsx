
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSystemSettings, updateSystemSettings as apiUpdateSystemSettings } from '../services/settings.service';

export interface SystemSettings {
    currentAcademicYear: string;
    currentSession: string;
    isRegistrationOpen: boolean;
}

interface SystemSettingsContextType {
    settings: SystemSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    updateSettings: (newSettings: SystemSettings) => Promise<{ success: boolean; error?: string }>;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export const SystemSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await getSystemSettings();
            if (response.success && response.settings) {
                setSettings(response.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: SystemSettings) => {
        try {
            const response = await apiUpdateSystemSettings(newSettings);
            if (response.success) {
                setSettings(newSettings);
                return { success: true };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to update settings' };
        }
    };

    return (
        <SystemSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettings }}>
            {children}
        </SystemSettingsContext.Provider>
    );
};

export const useSystemSettingsContext = () => {
    const context = useContext(SystemSettingsContext);
    if (!context) {
        throw new Error('useSystemSettingsContext must be used within a SystemSettingsProvider');
    }
    return context;
};
