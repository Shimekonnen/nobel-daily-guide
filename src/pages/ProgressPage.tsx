import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
  CheckCircle,
  XCircle,
  Brain,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getSkillLevels,
  getRecentAssessments,
  getSkillAreaDisplayName,
  getSkillAreaEmoji,
  getSkillAreaColors,
  type SkillArea,
} from '../services/assessmentService';
import type { AssessmentSession } from '../types/database';

// ============================================================================
// Types
// ============================================================================

interface SkillCardData {
  skillArea: SkillArea;
  currentLevel: number;
  trend: 'up' | 'down' | 'steady';
  lastAssessedDate: string | null;
}

// ============================================================================
// Mock Data for Charts
// ============================================================================

const MOCK_TREND_DATA = [
  { week: 'Week 1', reading: 5, math: 4, reasoning: 4, amharic: 2, vocabulary: 5 },
  { week: 'Week 2', reading: 5, math: 4, reasoning: 5, amharic: 2, vocabulary: 5 },
  { week: 'Week 3', reading: 5, math: 5, reasoning: 5, amharic: 2, vocabulary: 5 },
  { week: 'Week 4', reading: 6, math: 5, reasoning: 5, amharic: 2, vocabulary: 6 },
  { week: 'Week 5', reading: 6, math: 5, reasoning: 5, amharic: 2, vocabulary: 6 },
  { week: 'Week 6', reading: 6, math: 5, reasoning: 5, amharic: 2, vocabulary: 6 },
  { week: 'Week 7', reading: 6, math: 5, reasoning: 5, amharic: 2, vocabulary: 6 },
  { week: 'Week 8', reading: 6, math: 5, reasoning: 5, amharic: 2, vocabulary: 6 },
];

const MOCK_WEEKLY_SUMMARY = {
  summary: "Nobel had a strong week in math, mastering double-digit subtraction consistently. His reading comprehension continues to excel — consider introducing early chapter books with more complex plots. Amharic practice is progressing; he's responding well to the direction vocabulary.",
  achievements: [
    "Completed all math assessments with 80%+ accuracy",
    "Read independently for 45+ minutes daily",
    "Learned 5 new Amharic words (directions)",
  ],
  growthAreas: [
    "Pattern recognition showing steady improvement",
    "Vocabulary expanding through reading",
  ],
  focusNextWeek: [
    "Introduce basic multiplication through grouping activities",
    "Increase Amharic conversational practice during meals",
    "Try more challenging chapter books",
  ],
  parentTips: [
    "When doing math activities, ask Nobel to explain his thinking process — this reinforces understanding",
    "During Amharic practice, use the new direction words in treasure hunt games",
  ],
};

// ============================================================================
// Skill Level Card Component
// ============================================================================

function SkillLevelCard({ skillArea, currentLevel, trend, lastAssessedDate }: SkillCardData) {
  const colors = getSkillAreaColors(skillArea);
  const emoji = getSkillAreaEmoji(skillArea);
  const displayName = getSkillAreaDisplayName(skillArea);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-orange-500' : 'text-gray-400';

  const filledStars = Math.min(currentLevel, 10);
  const emptyStars = 10 - filledStars;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not yet assessed';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Simplify display name
  const simpleName = displayName
    .replace(' Mission', '')
    .replace(' Adventure', '')
    .replace(' Puzzles', '')
    .replace(' Explorer', '')
    .replace(' Power', '');

  return (
    <div
      className={`rounded-2xl p-4 bg-gradient-to-br ${colors.bg} text-white shadow-lg`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{emoji}</span>
        <div className={`flex items-center gap-1 ${trendColor} bg-white/20 rounded-full px-2 py-0.5`}>
          <TrendIcon className="w-4 h-4" />
        </div>
      </div>

      <h3 className="font-medium text-sm opacity-90 mb-1">{simpleName}</h3>

      <div className="text-3xl font-bold mb-2">Level {currentLevel}</div>

      <div className="text-xs mb-2 tracking-wide">
        {'★'.repeat(filledStars)}
        <span className="opacity-40">{'★'.repeat(emptyStars)}</span>
      </div>

      <p className="text-xs opacity-70">{formatDate(lastAssessedDate)}</p>
    </div>
  );
}

// ============================================================================
// Assessment Detail Component
// ============================================================================

function AssessmentDetail({
  session,
  isExpanded,
  onToggle,
}: {
  session: AssessmentSession;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const emoji = getSkillAreaEmoji(session.skill_area as SkillArea);
  const displayName = getSkillAreaDisplayName(session.skill_area as SkillArea);
  const colors = getSkillAreaColors(session.skill_area as SkillArea);

  const questions = session.questions || [];
  const correctCount = questions.filter((q) => q.is_correct).length;
  const scorePercent = session.score_percentage || 0;

  const getBadge = (percent: number) => {
    if (percent === 100) return { emoji: '🏆', label: 'Perfect!' };
    if (percent >= 80) return { emoji: '🌟', label: 'Great!' };
    if (percent >= 60) return { emoji: '💪', label: 'Good effort' };
    return { emoji: '🚀', label: 'Keep going' };
  };

  const badge = getBadge(scorePercent);

  // Simplify display name
  const simpleName = displayName
    .replace(' Mission', '')
    .replace(' Adventure', '')
    .replace(' Puzzles', '')
    .replace(' Explorer', '')
    .replace(' Power', '');

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-lg`}
          >
            {emoji}
          </div>
          <div className="text-left">
            <p className="font-medium text-text">{simpleName}</p>
            <p className="text-sm text-text-muted">
              {new Date(session.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-text">
              {correctCount}/{questions.length} — {scorePercent}%
            </p>
            <p className="text-sm">
              {badge.emoji} {badge.label}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </div>
      </button>

      {isExpanded && questions.length > 0 && (
        <div className="border-t border-border p-4 space-y-3 bg-gray-50">
          {questions.map((q, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {q.is_correct ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text mb-1">{q.question_text}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${
                    q.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    Nobel: {q.nobel_answer || 'No answer'}
                  </span>
                  {!q.is_correct && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Correct: {q.correct_answer}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Progress Page Component
// ============================================================================

export default function ProgressPage() {
  const navigate = useNavigate();
  const [skillCards, setSkillCards] = useState<SkillCardData[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);
  const [visibleSkills, setVisibleSkills] = useState<Record<SkillArea, boolean>>({
    reading: true,
    math: true,
    reasoning: true,
    amharic: true,
    vocabulary: true,
  });

  // Load data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const skillLevels = await getSkillLevels();
        const assessments = await getRecentAssessments(undefined, 5);

        const skillAreas: SkillArea[] = ['reading', 'math', 'reasoning', 'amharic', 'vocabulary'];
        const defaultLevels: Record<SkillArea, number> = {
          reading: 6,
          math: 5,
          reasoning: 5,
          amharic: 2,
          vocabulary: 6,
        };

        const cards: SkillCardData[] = skillAreas.map((skillArea) => {
          const skillLevel = skillLevels.find((s) => s.skill_area === skillArea);
          const relevantAssessments = assessments.filter((a) => a.skill_area === skillArea);
          const lastAssessment = relevantAssessments[0];

          // Determine trend from history
          let trend: 'up' | 'down' | 'steady' = 'steady';
          if (skillLevel?.level_history && skillLevel.level_history.length >= 2) {
            const history = skillLevel.level_history;
            const lastLevel = history[history.length - 1]?.level;
            const prevLevel = history[history.length - 2]?.level;
            if (lastLevel > prevLevel) trend = 'up';
            else if (lastLevel < prevLevel) trend = 'down';
          }

          return {
            skillArea,
            currentLevel: skillLevel?.current_level || defaultLevels[skillArea],
            trend,
            lastAssessedDate: lastAssessment?.date || null,
          };
        });

        setSkillCards(cards);
        setRecentAssessments(assessments);
      } catch (error) {
        console.error('Error loading progress data:', error);
        // Set default data
        const skillAreas: SkillArea[] = ['reading', 'math', 'reasoning', 'amharic', 'vocabulary'];
        const defaultLevels: Record<SkillArea, number> = {
          reading: 6,
          math: 5,
          reasoning: 5,
          amharic: 2,
          vocabulary: 6,
        };
        setSkillCards(
          skillAreas.map((skillArea) => ({
            skillArea,
            currentLevel: defaultLevels[skillArea],
            trend: 'steady' as const,
            lastAssessedDate: null,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleSkillVisibility = (skill: SkillArea) => {
    setVisibleSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  const getWeekRange = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const SKILL_COLORS: Record<SkillArea, string> = {
    reading: '#276749',
    math: '#1A365D',
    reasoning: '#553C9A',
    amharic: '#22543D',
    vocabulary: '#234E52',
  };

  return (
    <div className="flex-1 p-4 sm:p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text">Nobel's Progress</h1>
          <p className="text-text-muted">Week of {getWeekRange()}</p>
        </div>
      </div>

      {/* Skill Level Cards */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Current Levels</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-36 bg-surface animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {skillCards.map((card) => (
              <SkillLevelCard key={card.skillArea} {...card} />
            ))}
          </div>
        )}
      </div>

      {/* Trend Chart */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4">Progress Over Time</h2>

        {/* Skill toggles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['reading', 'math', 'reasoning', 'amharic', 'vocabulary'] as SkillArea[]).map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkillVisibility(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                visibleSkills[skill]
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              style={{
                backgroundColor: visibleSkills[skill] ? SKILL_COLORS[skill] : undefined,
              }}
            >
              {getSkillAreaEmoji(skill)} {skill.charAt(0).toUpperCase() + skill.slice(1)}
            </button>
          ))}
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              {visibleSkills.reading && (
                <Line
                  type="monotone"
                  dataKey="reading"
                  stroke={SKILL_COLORS.reading}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Reading"
                />
              )}
              {visibleSkills.math && (
                <Line
                  type="monotone"
                  dataKey="math"
                  stroke={SKILL_COLORS.math}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Math"
                />
              )}
              {visibleSkills.reasoning && (
                <Line
                  type="monotone"
                  dataKey="reasoning"
                  stroke={SKILL_COLORS.reasoning}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Reasoning"
                />
              )}
              {visibleSkills.amharic && (
                <Line
                  type="monotone"
                  dataKey="amharic"
                  stroke={SKILL_COLORS.amharic}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Amharic"
                />
              )}
              {visibleSkills.vocabulary && (
                <Line
                  type="monotone"
                  dataKey="vocabulary"
                  stroke={SKILL_COLORS.vocabulary}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Vocabulary"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly AI Summary */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-text">Weekly Summary</h2>
        </div>

        <p className="text-text mb-4">{MOCK_WEEKLY_SUMMARY.summary}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-xl p-4">
            <h3 className="font-medium text-green-700 mb-2">Achievements</h3>
            <ul className="space-y-1">
              {MOCK_WEEKLY_SUMMARY.achievements.map((item, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 rounded-xl p-4">
            <h3 className="font-medium text-blue-700 mb-2">Growth Areas</h3>
            <ul className="space-y-1">
              {MOCK_WEEKLY_SUMMARY.growthAreas.map((item, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 rounded-xl p-4">
            <h3 className="font-medium text-purple-700 mb-2">Focus Next Week</h3>
            <ul className="space-y-1">
              {MOCK_WEEKLY_SUMMARY.focusNextWeek.map((item, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 rounded-xl p-4">
            <h3 className="font-medium text-amber-700 mb-2">Parent Tips</h3>
            <ul className="space-y-1">
              {MOCK_WEEKLY_SUMMARY.parentTips.map((item, i) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Assessments */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Recent Assessments</h2>

        {recentAssessments.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-text mb-2">Ready to start learning?</h3>
            <p className="text-text-muted mb-4 max-w-sm mx-auto">
              Quick assessments help us personalize Nobel's learning journey. Each one takes just 2-3 minutes!
            </p>
            <button
              onClick={() => navigate('/assess')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
            >
              Start First Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAssessments.map((session) => (
              <AssessmentDetail
                key={session.id}
                session={session}
                isExpanded={expandedAssessment === session.id}
                onToggle={() =>
                  setExpandedAssessment(
                    expandedAssessment === session.id ? null : session.id
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
