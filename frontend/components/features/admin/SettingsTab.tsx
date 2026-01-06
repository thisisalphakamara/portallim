import React, { useEffect, useState } from 'react';
import { Select, Button, Switch } from '../../ui';
import { useSystemSettings } from '../../../hooks/useSystemSettings';

const SettingsTab: React.FC = () => {
    const { settings: globalSettings, loading: globalLoading, updateSettings } = useSystemSettings();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        currentAcademicYear: '',
        currentSession: '',
        isRegistrationOpen: true
    });

    useEffect(() => {
        if (globalSettings) {
            setSettings(globalSettings);
        }
    }, [globalSettings]);

    const generateAcademicYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        // Only show Previous, Current, and Next Year to reduce clutter
        // e.g. if 2026: 2025/2026, 2026/2027, 2027/2028
        for (let i = -1; i <= 1; i++) {
            const startYear = currentYear + i;
            years.push(`${startYear}/${startYear + 1}`);
        }
        return years;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await updateSettings(settings);
            if (response.success) {
                alert('Settings updated successfully!');
            } else {
                alert('Failed to update settings');
            }
        } catch (error) {
            alert('Error updating settings');
        } finally {
            setSaving(false);
        }
    };

    if (globalLoading) return <div>Loading settings...</div>;

    const academicYearOptions = generateAcademicYears().map(year => ({ value: year, label: year }));

    const sessionOptions = [
        { value: 'March - June', label: 'March - June Session' },
        { value: 'October - January', label: 'October - January Session' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-tighter">Global Registration Status</h4>
                        <p className="text-sm text-gray-600 mt-1">Control access to the registration system.</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${settings.isRegistrationOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {settings.isRegistrationOpen ? 'System Online' : 'System Offline'}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${settings.isRegistrationOpen ? 'border-green-500 bg-green-50/30' : 'border-gray-200 hover:border-black'}`}>
                        <div>
                            <p className="text-sm font-bold">Accept New Registrations</p>
                            <p className="text-xs text-gray-500">
                                {settings.isRegistrationOpen
                                    ? 'Students can currently access and submit registration forms.'
                                    : 'Registration forms are hidden. Students see a "Closed" message.'}
                            </p>
                        </div>
                        <Switch
                            checked={settings.isRegistrationOpen}
                            onChange={(checked) => setSettings({ ...settings, isRegistrationOpen: checked })}
                        />
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="mb-6">
                    <h4 className="text-lg font-black uppercase tracking-tighter">Active Session Configuration</h4>
                    <p className="text-sm text-gray-600 mt-1">
                        Set the current operational period. This tags all new registrations with this stamp.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Select
                        label="Academic Year"
                        value={settings.currentAcademicYear}
                        onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
                        options={academicYearOptions}
                        className="bg-white"
                    />
                    <Select
                        label="Registration Session"
                        value={settings.currentSession}
                        onChange={(e) => setSettings({ ...settings, currentSession: e.target.value })}
                        options={sessionOptions}
                        className="bg-white"
                    />
                </div>

                <div className="mt-4 flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-xs font-medium leading-relaxed">
                        <span className="font-bold">Note:</span> changing the Active Session will archive the current dashboard view for students.
                        They will be presented with a fresh registration form for the new session selected above.
                        Past records remain accessible to admins.
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button size="lg" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
