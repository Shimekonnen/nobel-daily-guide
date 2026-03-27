// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User, BookOpen, Sparkles, Home, Check,
  ChevronRight, ChevronLeft, Loader2, AlertCircle
} from 'lucide-react';

// Step definitions
const STEPS = [
  { id: 1, title: 'Child Info', icon: User },
  { id: 2, title: 'Academic Level', icon: BookOpen },
  { id: 3, title: 'Interests', icon: Sparkles },
  { id: 4, title: 'Home Setup', icon: Home },
  { id: 5, title: 'Confirm', icon: Check },
];

// Options
const READING_LEVELS = [
  { value: 'pre-reader', label: 'Pre-reader (knows some letters)' },
  { value: 'early-reader', label: 'Early reader (sounds out words)' },
  { value: '1st-grade', label: '1st grade level (reads simple books)' },
  { value: '2nd-grade', label: '2nd grade level (reads chapter books)' },
  { value: '3rd-grade-plus', label: '3rd grade+ (advanced reader)' },
];

const MATH_LEVELS = [
  { value: 'counting', label: 'Counting and number recognition' },
  { value: 'basic-operations', label: 'Basic addition and subtraction' },
  { value: 'advanced-operations', label: 'Advanced add/subtract (double digits)' },
  { value: 'multiplication', label: 'Early multiplication and division' },
];

const INTERESTS = [
  'Space', 'Maps', 'Animals', 'Dinosaurs', 'Building', 'Art',
  'Music', 'Sports', 'Cooking', 'Nature', 'Vehicles', 'Robots',
  'Science', 'Reading', 'Math', 'Puzzles'
];

const LANGUAGES = ['English', 'Amharic', 'Spanish', 'French', 'Arabic', 'Other'];

const INDOOR_EQUIPMENT = [
  'Trampoline', 'Slides', 'Keyboard/Piano', 'Basketball hoop',
  'Legos/Blocks', 'Art supplies', 'Books', 'Tablet (limited use)'
];

const OUTDOOR_EQUIPMENT = ['Bikes', 'Playground access', 'Yard/Garden'];

interface WizardData {
  childName: string;
  dateOfBirth: string;
  readingLevel: string;
  mathLevel: string;
  interests: string[];
  languages: string[];
  contentRestrictions: string;
  indoorEquipment: string[];
  outdoorEquipment: string[];
  hasSiblings: boolean;
  siblingAges: string;
}

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    childName: '',
    dateOfBirth: '',
    readingLevel: '',
    mathLevel: '',
    interests: [],
    languages: ['English'],
    contentRestrictions: '',
    indoorEquipment: [],
    outdoorEquipment: [],
    hasSiblings: false,
    siblingAges: '',
  });

  const { user, refreshChildProfile } = useAuth();
  const navigate = useNavigate();

  const updateData = (field: keyof WizardData, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'interests' | 'languages' | 'indoorEquipment' | 'outdoorEquipment', item: string) => {
    setData(prev => {
      const current = prev[field];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.childName.trim() !== '' && data.dateOfBirth !== '';
      case 2:
        return data.readingLevel !== '' && data.mathLevel !== '';
      case 3:
        return data.interests.length > 0;
      case 4:
        return true; // Equipment is optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate Amharic level based on selected languages
      const amharicLevel = data.languages.includes('Amharic')
        ? 'early vocabulary'
        : 'none';

      // Create child profile
      const { data: profile, error: profileError } = await supabase
        .from('child_profiles')
        .insert({
          user_id: user.id,
          name: data.childName,
          date_of_birth: data.dateOfBirth,
          reading_level: READING_LEVELS.find(r => r.value === data.readingLevel)?.label || data.readingLevel,
          math_level: MATH_LEVELS.find(m => m.value === data.mathLevel)?.label || data.mathLevel,
          amharic_level: amharicLevel,
          interests: data.interests.map(i => i.toLowerCase()),
          learning_style: 'hands-on, real-world, play-based',
          content_restrictions: data.contentRestrictions ? [data.contentRestrictions] : [],
          physical_resources: [...data.indoorEquipment, ...data.outdoorEquipment],
          screen_time_limit_minutes: 60,
        } as Record<string, unknown>)
        .select()
        .single();

      if (profileError) throw profileError;

      // Initialize skill levels based on academic levels
      const readingSkillLevel = getSkillLevel(data.readingLevel);
      const mathSkillLevel = getMathSkillLevel(data.mathLevel);
      const profileId = (profile as { id: string }).id;

      const skillLevelsToInsert = [
        { profile_id: profileId, skill_area: 'reading', current_level: readingSkillLevel, level_history: [] },
        { profile_id: profileId, skill_area: 'math', current_level: mathSkillLevel, level_history: [] },
        { profile_id: profileId, skill_area: 'reasoning', current_level: 5, level_history: [] },
        { profile_id: profileId, skill_area: 'vocabulary', current_level: readingSkillLevel, level_history: [] },
        { profile_id: profileId, skill_area: 'amharic', current_level: data.languages.includes('Amharic') ? 3 : 1, level_history: [] },
      ];

      const { error: skillsError } = await supabase
        .from('skill_levels')
        .insert(skillLevelsToInsert as Record<string, unknown>[]);

      if (skillsError) {
        console.error('Error creating skill levels:', skillsError);
        // Don't throw - profile was created successfully
      }

      // Refresh the auth context
      await refreshChildProfile();

      // Navigate to today page
      navigate('/today');
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSkillLevel = (readingLevel: string): number => {
    switch (readingLevel) {
      case 'pre-reader': return 2;
      case 'early-reader': return 4;
      case '1st-grade': return 5;
      case '2nd-grade': return 6;
      case '3rd-grade-plus': return 8;
      default: return 5;
    }
  };

  const getMathSkillLevel = (mathLevel: string): number => {
    switch (mathLevel) {
      case 'counting': return 2;
      case 'basic-operations': return 4;
      case 'advanced-operations': return 6;
      case 'multiplication': return 7;
      default: return 4;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome! Let's Get Started</h1>
          <p className="text-gray-500 mt-1">Tell us about your child to personalize their learning experience</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 px-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${currentStep >= step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'}
                `}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 rounded ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={data.childName}
                  onChange={(e) => updateData('childName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your child's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => updateData('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reading Level
                </label>
                <div className="space-y-2">
                  {READING_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-all
                        ${data.readingLevel === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <input
                        type="radio"
                        name="readingLevel"
                        value={level.value}
                        checked={data.readingLevel === level.value}
                        onChange={(e) => updateData('readingLevel', e.target.value)}
                        className="sr-only"
                      />
                      <span className={data.readingLevel === level.value ? 'text-blue-700' : 'text-gray-700'}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Math Level
                </label>
                <div className="space-y-2">
                  {MATH_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-all
                        ${data.mathLevel === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <input
                        type="radio"
                        name="mathLevel"
                        value={level.value}
                        checked={data.mathLevel === level.value}
                        onChange={(e) => updateData('mathLevel', e.target.value)}
                        className="sr-only"
                      />
                      <span className={data.mathLevel === level.value ? 'text-blue-700' : 'text-gray-700'}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleArrayItem('interests', interest)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${data.interests.includes(interest)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages at Home
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem('languages', lang)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${data.languages.includes(lang)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Restrictions (optional)
                </label>
                <textarea
                  value={data.contentRestrictions}
                  onChange={(e) => updateData('contentRestrictions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any topics to avoid?"
                  rows={2}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indoor Equipment (select all you have)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INDOOR_EQUIPMENT.map((item) => (
                    <label
                      key={item}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-all
                        ${data.indoorEquipment.includes(item)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={data.indoorEquipment.includes(item)}
                        onChange={() => toggleArrayItem('indoorEquipment', item)}
                        className="sr-only"
                      />
                      <span className={`text-sm ${data.indoorEquipment.includes(item) ? 'text-blue-700' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outdoor Access
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OUTDOOR_EQUIPMENT.map((item) => (
                    <label
                      key={item}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-all
                        ${data.outdoorEquipment.includes(item)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={data.outdoorEquipment.includes(item)}
                        onChange={() => toggleArrayItem('outdoorEquipment', item)}
                        className="sr-only"
                      />
                      <span className={`text-sm ${data.outdoorEquipment.includes(item) ? 'text-green-700' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                  <input
                    type="checkbox"
                    checked={data.hasSiblings}
                    onChange={(e) => updateData('hasSiblings', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Has siblings</span>
                </label>
                {data.hasSiblings && (
                  <input
                    type="text"
                    value={data.siblingAges}
                    onChange={(e) => updateData('siblingAges', e.target.value)}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sibling ages (e.g., '2 years, 6 years')"
                  />
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Review Your Information</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Child's Name:</span>
                  <span className="font-medium">{data.childName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date of Birth:</span>
                  <span className="font-medium">{data.dateOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reading Level:</span>
                  <span className="font-medium">
                    {READING_LEVELS.find(r => r.value === data.readingLevel)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Math Level:</span>
                  <span className="font-medium">
                    {MATH_LEVELS.find(m => m.value === data.mathLevel)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Interests:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.interests.map(i => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Languages:</span>
                  <span className="font-medium ml-2">{data.languages.join(', ')}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                You can update these settings anytime in the Settings page.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
              ${currentStep === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'}
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                ${canProceed()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              Start Generating Schedules!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
