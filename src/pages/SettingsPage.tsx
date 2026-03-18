import { useState, useEffect } from 'react';
import {
  Settings,
  Lightbulb,
  ToggleLeft,
  ToggleRight,
  Info,
  User,
  Calendar,
  Bell,
  Clock,
  Trash2,
  RefreshCw,
  ChevronRight,
  Cake,
  Sparkles,
  BookOpen,
  Brain,
} from 'lucide-react';
import { getSettings, setSetting, type AppSettings } from '../services/settingsService';

// Mock child profile data (would come from Supabase in real app)
const mockChildProfile = {
  name: 'Nobel',
  age: 4,
  birthday: 'June 15, 2020',
  learningLevel: 'Advanced',
  interests: ['Space', 'Animals', 'Maps', 'Music', 'Building'],
  currentSkillLevels: {
    math: 'Level 3',
    reading: 'Level 2',
    amharic: 'Level 1',
    reasoning: 'Level 2',
    vocabulary: 'Level 3',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({ showLearningHints: true });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Handle toggle change
  const handleToggle = (key: keyof AppSettings, value: boolean) => {
    setSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-text-muted/10 rounded-xl">
          <Settings className="w-8 h-8 text-text-muted" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text">Settings</h1>
          <p className="text-text-muted">Profile & preferences</p>
        </div>
      </div>

      {/* Nobel's Profile Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Nobel's Profile
        </h2>

        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                N
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text">{mockChildProfile.name}</h3>
                <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Cake className="w-4 h-4" />
                    {mockChildProfile.age} years old
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {mockChildProfile.learningLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="p-4 sm:p-5 border-t border-border">
            <h4 className="text-sm font-medium text-text mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {mockChildProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Skill Levels Summary */}
          <div className="p-4 sm:p-5 border-t border-border">
            <h4 className="text-sm font-medium text-text mb-3">Current Skill Levels</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(mockChildProfile.currentSkillLevels).map(([skill, level]) => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <span className="text-sm text-text capitalize">{skill}</span>
                  <span className="text-xs font-medium text-primary">{level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Profile Button */}
          <button className="w-full p-4 border-t border-border flex items-center justify-between hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-primary">Edit Profile</span>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Assessment Settings Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Assessment Settings
        </h2>

        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Learning Hints Toggle */}
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-text mb-1">
                  Show learning hints during assessments
                </h3>
                <p className="text-sm text-text-muted">
                  When Nobel answers incorrectly, show a helpful tip to guide their thinking
                  (without revealing the answer).
                </p>
              </div>
              <button
                onClick={() => handleToggle('showLearningHints', !settings.showLearningHints)}
                className="flex-shrink-0 mt-1"
                aria-label={settings.showLearningHints ? 'Disable hints' : 'Enable hints'}
              >
                {settings.showLearningHints ? (
                  <ToggleRight className="w-12 h-7 text-primary" />
                ) : (
                  <ToggleLeft className="w-12 h-7 text-text-muted" />
                )}
              </button>
            </div>

            {/* Example hint preview */}
            {settings.showLearningHints && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Example Tip</span>
                </div>
                <p className="text-sm text-amber-700">
                  "Try counting backwards from 24 to 18!"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Preferences Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Schedule Preferences
        </h2>

        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          {/* Wake Time */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-text">Wake Time</h3>
                <p className="text-sm text-text-muted">Daily schedule start</p>
              </div>
            </div>
            <span className="font-medium text-text">7:00 AM</span>
          </div>

          {/* Bedtime */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-text">Bedtime</h3>
                <p className="text-sm text-text-muted">Daily schedule end</p>
              </div>
            </div>
            <span className="font-medium text-text">8:00 PM</span>
          </div>

          {/* Learning Focus */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-text">Learning Sessions</h3>
                <p className="text-sm text-text-muted">Daily learning time target</p>
              </div>
            </div>
            <span className="font-medium text-text">3-4 hours</span>
          </div>

          {/* Edit Schedule Preferences Button */}
          <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-primary">Edit Schedule Preferences</span>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          Notifications
        </h2>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text">Daily Reminders</h3>
              <p className="text-sm text-text-muted">
                Get notified about scheduled activities and assessments
              </p>
            </div>
            <ToggleRight className="w-12 h-7 text-primary" />
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-slate-500" />
          Data Management
        </h2>

        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          {/* Sync Status */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text">Sync Status</h3>
              <p className="text-sm text-text-muted">Last synced: Just now</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>

          {/* Reset Progress */}
          <div className="p-4 sm:p-5">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Reset All Progress Data</span>
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 mb-3">
                  Are you sure? This will reset all skill levels and assessment history.
                  This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Would reset data here
                      setShowResetConfirm(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    Reset Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-text-muted" />
          About
        </h2>

        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-medium text-text mb-2">Nobel's Daily Guide</h3>
          <p className="text-sm text-text-muted mb-3">
            An AI-powered daily planning and developmental tracking app for Nobel.
            Generates personalized schedules, activities, book recommendations, and
            adaptive assessments.
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Version 0.1.0 (MVP)
            </p>
            <p className="text-xs text-text-muted">
              Powered by Claude AI
            </p>
          </div>
        </div>
      </div>

      {/* Future Settings Placeholder */}
      <div className="bg-surface rounded-2xl border border-border border-dashed p-4 sm:p-5">
        <p className="text-sm text-text-muted text-center">
          More settings coming soon: Account management, export data,
          schedule templates, and theme preferences.
        </p>
      </div>
    </div>
  );
}
