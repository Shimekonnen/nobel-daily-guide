import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, ArrowRight, Home, Sparkles, Lightbulb } from 'lucide-react';
import {
  type SkillArea,
  getSkillLevels,
  getLastAssessmentForSkill,
  generateAssessment,
  saveAssessmentResults,
  getSkillAreaDisplayName,
  getSkillAreaEmoji,
  getSkillAreaColors,
  levelToStars,
  type AssessmentAnswer,
} from '../services/assessmentService';
import {
  getMockAssessment,
  getRandomEncouragement,
  getAchievementBadge,
  type AssessmentQuestion,
} from '../services/mockAssessment';
import { getSetting } from '../services/settingsService';
import type { SkillLevel, AssessmentSession } from '../types/database';

// ============================================================================
// Types
// ============================================================================

type AssessmentState = 'selection' | 'loading' | 'in_progress' | 'feedback' | 'results';

interface SkillCardData {
  skillArea: SkillArea;
  level: number;
  lastAssessment?: AssessmentSession | null;
}

// ============================================================================
// Skill Card Component (Pre-assessment)
// ============================================================================

function SkillCard({
  skillArea,
  level,
  lastAssessment,
  onStart,
}: SkillCardData & { onStart: (skill: SkillArea) => void }) {
  const colors = getSkillAreaColors(skillArea);
  const emoji = getSkillAreaEmoji(skillArea);
  const displayName = getSkillAreaDisplayName(skillArea);
  const stars = levelToStars(level);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${colors.bg} text-white shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-8xl opacity-20 transform translate-x-4 -translate-y-2">
        {emoji}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-4xl mb-2">{emoji}</div>
        <h3 className="text-xl font-bold mb-1">{displayName}</h3>
        <div className="text-lg mb-3">{stars}</div>
        <p className="text-sm opacity-80 mb-4">Level {level}</p>

        {lastAssessment && (
          <div className="text-xs opacity-70 mb-4">
            Last: {formatDate(lastAssessment.date)} - {lastAssessment.score_percentage}%
          </div>
        )}

        <button
          onClick={() => onStart(skillArea)}
          className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5" />
          Start Mission!
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Question Display Component (Kid Mode)
// ============================================================================

function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  showingFeedback,
  feedbackMessage,
  isCorrect,
  skillArea,
  theme,
  showingHint,
  hintText,
}: {
  question: AssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onNext: () => void;
  showingFeedback: boolean;
  feedbackMessage: string;
  isCorrect: boolean | null;
  skillArea: SkillArea;
  theme: string;
  showingHint: boolean;
  hintText: string | null;
}) {
  const colors = getSkillAreaColors(skillArea);
  const emoji = getSkillAreaEmoji(skillArea);

  // Progress dots
  const progressDots = Array.from({ length: totalQuestions }, (_, i) => (
    <div
      key={i}
      className={`w-4 h-4 rounded-full transition-all ${
        i < questionNumber
          ? 'bg-white'
          : i === questionNumber
          ? 'bg-white scale-125'
          : 'bg-white/40'
      }`}
    />
  ));

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${colors.bg} flex flex-col z-50`}>
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 text-white text-lg sm:text-xl font-bold mb-4">
          <span className="text-2xl">{emoji}</span>
          <span>{theme}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {progressDots}
        </div>
        <p className="text-center text-white/80 text-sm">
          Question {questionNumber + 1} of {totalQuestions}
        </p>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-8">
        {showingFeedback ? (
          /* Feedback Display */
          <div className="text-center animate-bounce-gentle">
            <div className="text-6xl sm:text-8xl mb-4">
              {isCorrect ? '🌟' : '💪'}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {feedbackMessage}
            </p>

            {/* Learning Hint (shown after incorrect answer) */}
            {showingHint && hintText && (
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4 sm:p-6 mb-6 max-w-lg mx-auto animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lightbulb className="w-6 h-6 text-yellow-300" />
                  <span className="text-lg font-semibold text-yellow-200">Tip</span>
                </div>
                <p className="text-lg sm:text-xl text-white/95">{hintText}</p>
              </div>
            )}

            {!showingHint && (
              <button
                onClick={onNext}
                className="py-4 px-8 bg-white text-gray-800 rounded-2xl font-bold text-xl flex items-center gap-2 mx-auto hover:bg-gray-100 transition-colors shadow-lg mt-4"
              >
                Next <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </div>
        ) : (
          /* Question Display */
          <>
            {/* Question Text */}
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 sm:p-8 mb-6 max-w-2xl w-full">
              <p className="text-xl sm:text-2xl font-semibold text-white text-center leading-relaxed">
                {question.question_text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-6">
              {question.options?.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswer === option;

                return (
                  <button
                    key={index}
                    onClick={() => onSelectAnswer(option)}
                    className={`p-4 sm:p-6 rounded-2xl text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? 'bg-white text-gray-800 shadow-lg scale-[1.02]'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-white/20'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-lg sm:text-xl font-medium flex-1">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm Button */}
            {selectedAnswer && (
              <button
                onClick={onNext}
                className="py-4 px-8 bg-white text-gray-800 rounded-2xl font-bold text-xl flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg animate-fade-in"
              >
                Check Answer <Sparkles className="w-6 h-6" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Results Display Component
// ============================================================================

function ResultsDisplay({
  correctCount,
  totalQuestions,
  skillArea,
  onFinish,
}: {
  correctCount: number;
  totalQuestions: number;
  skillArea: SkillArea;
  onFinish: () => void;
}) {
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const { emoji: badgeEmoji, title: badgeTitle } = getAchievementBadge(scorePercentage);
  const colors = getSkillAreaColors(skillArea);

  // Stars visualization
  const stars = Array.from({ length: totalQuestions }, (_, i) => (
    <span
      key={i}
      className={`text-4xl sm:text-5xl transition-all ${
        i < correctCount ? 'animate-star-pop' : 'opacity-30'
      }`}
      style={{ animationDelay: `${i * 0.15}s` }}
    >
      ⭐
    </span>
  ));

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${colors.bg} flex flex-col items-center justify-center z-50 p-6`}>
      {/* Celebration */}
      <div className="text-center animate-bounce-gentle">
        <div className="text-6xl sm:text-8xl mb-4 animate-pulse">🎉</div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
          Mission Complete!
        </h1>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">{stars}</div>

        <p className="text-xl sm:text-2xl text-white/90 mb-8">
          You earned {correctCount} out of {totalQuestions} stars!
        </p>

        {/* Badge */}
        <div className="bg-white/20 backdrop-blur rounded-3xl p-6 sm:p-8 mb-8 inline-block">
          <div className="text-6xl sm:text-7xl mb-2">{badgeEmoji}</div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{badgeTitle}</p>
        </div>

        {/* Home Button */}
        <button
          onClick={onFinish}
          className="py-4 px-8 bg-white text-gray-800 rounded-2xl font-bold text-xl flex items-center gap-2 mx-auto hover:bg-gray-100 transition-colors shadow-lg"
        >
          <Home className="w-6 h-6" />
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Assess Page Component
// ============================================================================

export default function AssessPage() {
  const navigate = useNavigate();

  // State
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('selection');
  const [skillCards, setSkillCards] = useState<SkillCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Assessment state
  const [currentSkillArea, setCurrentSkillArea] = useState<SkillArea | null>(null);
  const [sessionTheme, setSessionTheme] = useState('');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showingHint, setShowingHint] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showLearningHints, setShowLearningHints] = useState(true);

  // Load settings and skill levels
  useEffect(() => {
    // Load settings
    setShowLearningHints(getSetting('showLearningHints'));

    async function loadData() {
      setLoading(true);
      try {
        const skillLevels = await getSkillLevels();
        const skillAreas: SkillArea[] = ['math', 'reading', 'reasoning', 'amharic', 'vocabulary'];

        const cards: SkillCardData[] = await Promise.all(
          skillAreas.map(async (skillArea) => {
            const skillLevel = skillLevels.find((s) => s.skill_area === skillArea);
            const lastAssessment = await getLastAssessmentForSkill(skillArea);
            return {
              skillArea,
              level: skillLevel?.current_level || 5,
              lastAssessment,
            };
          })
        );

        setSkillCards(cards);
      } catch (error) {
        console.error('Error loading assessment data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Start assessment
  const handleStartAssessment = useCallback(async (skillArea: SkillArea, useMock: boolean = false) => {
    setCurrentSkillArea(skillArea);
    setAssessmentState('loading');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);

    try {
      let assessment;
      if (useMock) {
        const mock = getMockAssessment(skillArea);
        assessment = {
          session_theme: mock.session_theme,
          questions: mock.questions,
        };
      } else {
        const skillCard = skillCards.find((s) => s.skillArea === skillArea);
        const level = skillCard?.level || 5;
        assessment = await generateAssessment(skillArea, level);
      }

      setSessionTheme(assessment.session_theme);
      setQuestions(assessment.questions);
      setAssessmentState('in_progress');
    } catch (error) {
      console.error('Error starting assessment:', error);
      // Fall back to mock on error
      const mock = getMockAssessment(skillArea);
      setSessionTheme(mock.session_theme);
      setQuestions(mock.questions);
      setAssessmentState('in_progress');
    }
  }, [skillCards]);

  // Handle answer selection
  const handleSelectAnswer = (answer: string) => {
    if (!showingFeedback) {
      setSelectedAnswer(answer);
    }
  };

  // Handle next question
  const handleNext = useCallback(() => {
    if (showingFeedback && !showingHint) {
      // Move to next question
      setShowingFeedback(false);
      setSelectedAnswer(null);
      setCurrentHint(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Assessment complete
        setAssessmentState('results');
      }
    } else if (!showingFeedback) {
      // Check answer and show feedback
      const currentQuestion = questions[currentQuestionIndex];
      const correct = selectedAnswer === currentQuestion.correct_answer;

      setIsCorrect(correct);
      setFeedbackMessage(getRandomEncouragement(correct));
      setShowingFeedback(true);

      // Show hint for incorrect answers if setting is enabled and hint exists
      if (!correct && showLearningHints && currentQuestion.hint) {
        setCurrentHint(currentQuestion.hint);
        setShowingHint(true);

        // Auto-hide hint after 2 seconds
        setTimeout(() => {
          setShowingHint(false);
        }, 2000);
      }

      // Record answer
      setAnswers((prev) => [
        ...prev,
        {
          question_id: currentQuestion.id,
          question_text: currentQuestion.question_text,
          correct_answer: currentQuestion.correct_answer,
          user_answer: selectedAnswer || '',
          is_correct: correct,
          difficulty: currentQuestion.difficulty,
        },
      ]);
    }
  }, [showingFeedback, showingHint, currentQuestionIndex, questions, selectedAnswer, showLearningHints]);

  // Handle assessment completion
  const handleFinish = useCallback(async () => {
    if (!currentSkillArea) return;

    // Save results to Supabase
    const skillCard = skillCards.find((s) => s.skillArea === currentSkillArea);
    await saveAssessmentResults({
      skill_area: currentSkillArea,
      difficulty_level: skillCard?.level || 5,
      questions: answers,
      session_theme: sessionTheme,
    });

    // Reset and go to home
    setAssessmentState('selection');
    setCurrentSkillArea(null);
    setQuestions([]);
    setAnswers([]);
    navigate('/');
  }, [currentSkillArea, skillCards, answers, sessionTheme, navigate]);

  // Calculate correct count
  const correctCount = answers.filter((a) => a.is_correct).length;

  // Render based on state
  if (assessmentState === 'loading') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <p className="text-2xl font-bold">Preparing your mission...</p>
        </div>
      </div>
    );
  }

  if (assessmentState === 'in_progress' || assessmentState === 'feedback') {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !currentSkillArea) return null;

    return (
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={handleSelectAnswer}
        onNext={handleNext}
        showingFeedback={showingFeedback}
        feedbackMessage={feedbackMessage}
        isCorrect={isCorrect}
        skillArea={currentSkillArea}
        theme={sessionTheme}
        showingHint={showingHint}
        hintText={currentHint}
      />
    );
  }

  if (assessmentState === 'results' && currentSkillArea) {
    return (
      <ResultsDisplay
        correctCount={correctCount}
        totalQuestions={questions.length}
        skillArea={currentSkillArea}
        onFinish={handleFinish}
      />
    );
  }

  // Selection state (default)
  return (
    <div className="flex-1 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Star className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text">Learning Missions</h1>
          <p className="text-text-muted">Choose a mission to start!</p>
        </div>
      </div>

      {/* Sample Assessment Button */}
      <button
        onClick={() => handleStartAssessment('math', true)}
        className="w-full mb-6 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
      >
        <Sparkles className="w-5 h-5" />
        Use Sample Assessment (Space Explorer)
      </button>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-48 bg-surface animate-pulse rounded-3xl"
            />
          ))}
        </div>
      ) : (
        /* Skill Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skillCards.map((card) => (
            <SkillCard
              key={card.skillArea}
              {...card}
              onStart={handleStartAssessment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
