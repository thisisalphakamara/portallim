import { useSystemSettingsContext } from '../contexts/SystemSettingsContext';
import { SystemSettings } from '../contexts/SystemSettingsContext'; // Import Type

export type { SystemSettings };

export const useSystemSettings = () => {
    const { settings, loading, refreshSettings, updateSettings } = useSystemSettingsContext();
    return { settings, loading, refreshSettings, updateSettings };
};
