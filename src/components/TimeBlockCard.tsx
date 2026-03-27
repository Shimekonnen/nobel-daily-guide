import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, SkipForward, RefreshCw, Loader2, FileText, ThumbsUp, ThumbsDown, Clock, Sparkles } from 'lucide-react';
import type { TimeBlock, TimeBlockCategory, DevelopmentalDomain, ParentFeedback } from '../types/database';

// Category configuration
const CATEGORY_CONFIG: Record<TimeBlockCategory | 'free_play', { emoji: string; color: string; label: string }> = {
  sibling_play: { emoji: '🎭', color: '#F5A623', label: 'Sibling Play' },
  independent_play: { emoji: '🧩', color: '#50C878', label: 'Independent Play' },
  focused_learning: { emoji: '📚', color: '#4A90D9', label: 'Focused Learning' },
  amharic: { emoji: '🇪🇹', color: '#2ECC71', label: 'Amharic' },
  lunch: { emoji: '🍽️', color: '#A0522D', label: 'Lunch' },
  dinner: { emoji: '🍽️', color: '#A0522D', label: 'Dinner' },
  outdoor: { emoji: '🚶', color: '#87CEEB', label: 'Outdoor' },
  rest: { emoji: '😴', color: '#B39DDB', label: 'Rest' },
  reading: { emoji: '📖', color: '#5C6BC0', label: 'Reading' },
  routine: { emoji: '🛁', color: '#9E9E9E', label: 'Routine' },
  cleanup: { emoji: '🧹', color: '#9E9E9E', label: 'Cleanup' },
  free_play: { emoji: '🎮', color: '#9E9E9E', label: 'Free Play' },
};

// Domain colors for structured blocks
const DOMAIN_COLORS: Record<DevelopmentalDomain, { bg: string; text: string; label: string }> = {
  academic: { bg: '#EBF5FF', text: '#1E40AF', label: 'Academic' },
  social_emotional: { bg: '#FEF3C7', text: '#92400E', label: 'Social-Emotional' },
  executive_function: { bg: '#F3E8FF', text: '#6B21A8', label: 'Executive Function' },
  fine_motor: { bg: '#ECFDF5', text: '#065F46', label: 'Fine Motor' },
  physical: { bg: '#FEE2E2', text: '#991B1B', label: 'Physical' },
  creative: { bg: '#FCE7F3', text: '#9D174D', label: 'Creative' },
  cultural: { bg: '#D1FAE5', text: '#047857', label: 'Cultural/Amharic' },
};

interface TimeBlockCardProps {
  block: TimeBlock;
  isActive?: boolean;
  onMarkDone: (id: string) => Promise<void>;
  onMarkSkipped: (id: string) => Promise<void>;
  onRegenerate: (id: string) => Promise<void>;
  onFeedback?: (id: string, feedback: ParentFeedback) => Promise<void>;
  onViewWorksheet?: (block: TimeBlock) => void;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Parse activity name with format "[Domain]: [Activity Name]"
function parseActivityName(name: string): { activityType: string | null; activityName: string } {
  if (name.includes(': ')) {
    const [type, ...rest] = name.split(': ');
    return {
      activityType: type.trim(),
      activityName: rest.join(': ').trim(),
    };
  }
  // Fallback for old format "[Type] - [Name]"
  if (name.includes(' - ')) {
    const [type, ...rest] = name.split(' - ');
    return {
      activityType: type.trim(),
      activityName: rest.join(' - ').trim(),
    };
  }
  return { activityType: null, activityName: name };
}

// Check if this is a minimal display block
function isMinimalBlock(block: TimeBlock): boolean {
  // Use display_type if available, otherwise infer from category
  if (block.display_type) {
    return block.display_type === 'minimal';
  }
  // Legacy fallback: these categories are typically minimal
  return ['lunch', 'dinner', 'free_play', 'independent_play', 'rest', 'reading'].includes(block.category);
}

export default function TimeBlockCard({
  block,
  isActive = false,
  onMarkDone,
  onMarkSkipped,
  onRegenerate,
  onFeedback,
  onViewWorksheet,
}: TimeBlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'done' | 'skip' | 'regenerate' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimeout, setFeedbackTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isMinimal = isMinimalBlock(block);
  const config = CATEGORY_CONFIG[block.category as keyof typeof CATEGORY_CONFIG] || {
    emoji: '📌',
    color: '#9E9E9E',
    label: block.category,
  };

  const isDone = block.status === 'done';
  const isSkipped = block.status === 'skipped';
  const domainConfig = block.developmental_domain ? DOMAIN_COLORS[block.developmental_domain] : null;

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }
    };
  }, [feedbackTimeout]);

  const handleAction = async (action: 'done' | 'skip' | 'regenerate') => {
    setIsLoading(true);
    setLoadingAction(action);
    try {
      if (action === 'done') {
        await onMarkDone(block.id);
        // Show feedback options for structured blocks only
        if (!isMinimal && onFeedback) {
          setShowFeedback(true);
          // Auto-hide after 3 seconds
          const timeout = setTimeout(() => {
            setShowFeedback(false);
          }, 3000);
          setFeedbackTimeout(timeout);
        }
      } else if (action === 'skip') {
        await onMarkSkipped(block.id);
      } else if (action === 'regenerate') {
        await onRegenerate(block.id);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleFeedback = async (feedback: ParentFeedback) => {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }
    setShowFeedback(false);
    if (onFeedback) {
      await onFeedback(block.id, feedback);
    }
  };

  // MINIMAL CARD DISPLAY
  if (isMinimal) {
    return (
      <div
        className={`
          relative bg-gray-50 rounded-lg border border-dashed border-gray-200 overflow-hidden
          ${isDone ? 'opacity-50' : ''}
          ${isSkipped ? 'opacity-30' : ''}
        `}
      >
        {/* Subtle left stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
          style={{ backgroundColor: config.color }}
        />

        <div className="pl-3 pr-3 py-2 flex items-center gap-3">
          {/* Time */}
          <div className="flex-shrink-0 text-xs text-gray-400 min-w-[55px]">
            {formatTime(block.start_time)}
          </div>

          {/* Emoji and Name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg opacity-60">{config.emoji}</span>
            <span className={`text-sm text-gray-500 truncate ${isSkipped ? 'line-through' : ''}`}>
              {block.activity_name}
            </span>
            {isDone && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
          </div>

          {/* Brief note for free play */}
          {block.description && (block.category === 'free_play' || block.category === 'independent_play') && (
            <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[150px]">
              {block.description}
            </span>
          )}
        </div>
      </div>
    );
  }

  // STRUCTURED CARD DISPLAY (Full card with details)
  return (
    <div
      className={`
        relative bg-white rounded-xl border overflow-hidden transition-all duration-200 shadow-sm
        ${isActive ? 'border-blue-400 shadow-lg ring-2 ring-blue-100' : 'border-gray-200'}
        ${isDone ? 'opacity-70' : ''}
        ${isSkipped ? 'opacity-40' : ''}
      `}
    >
      {/* Domain color stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: domainConfig?.text || config.color }}
      />

      {/* Main content */}
      <div className="pl-4 pr-3 py-3">
        {/* Header row */}
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Time and emoji */}
          <div className="flex-shrink-0 text-center min-w-[60px]">
            <div className="text-2xl mb-1">{config.emoji}</div>
            <div className="text-xs text-gray-500">
              {formatTime(block.start_time)}
            </div>
            <div className="text-xs text-gray-400">
              {formatTime(block.end_time)}
            </div>
          </div>

          {/* Activity info */}
          <div className="flex-1 min-w-0">
            {(() => {
              const { activityType, activityName } = parseActivityName(block.activity_name);

              return (
                <>
                  {/* Domain/Activity Type Label */}
                  {(domainConfig || activityType) && (
                    <div className="mb-1">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: domainConfig?.bg || '#F3F4F6',
                          color: domainConfig?.text || '#6B7280',
                        }}
                      >
                        {activityType || domainConfig?.label}
                      </span>
                    </div>
                  )}

                  {/* Activity Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-semibold text-gray-900 ${
                        isSkipped ? 'line-through' : ''
                      }`}
                    >
                      {activityName}
                    </h3>
                    {isDone && (
                      <span className="flex-shrink-0 text-green-500">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  {block.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {block.description}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Expand button */}
          <button
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            {/* Setup time and cleanup level */}
            {(block.setup_time_minutes || block.cleanup_level) && (
              <div className="flex gap-4 text-xs text-gray-500">
                {block.setup_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Setup: {block.setup_time_minutes} min</span>
                  </div>
                )}
                {block.cleanup_level && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Cleanup: {block.cleanup_level}</span>
                  </div>
                )}
              </div>
            )}

            {/* Materials needed */}
            {block.materials_needed && block.materials_needed.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Materials Needed
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {block.materials_needed.map((material, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-100 text-sm text-gray-700 rounded-full"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning objective */}
            {block.learning_objective && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Learning Objective
                </h4>
                <p className="text-sm text-gray-700">{block.learning_objective}</p>
              </div>
            )}

            {/* Difficulty badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Difficulty:
              </span>
              <span
                className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${block.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
                  ${block.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${block.difficulty === 'challenging' ? 'bg-red-100 text-red-700' : ''}
                `}
              >
                {block.difficulty}
              </span>
            </div>

            {/* Tags */}
            {block.tags && block.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {block.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-50 text-xs text-blue-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Worksheet button */}
            {block.has_worksheet && onViewWorksheet && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewWorksheet(block);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors w-full justify-center"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">View & Print Worksheet</span>
              </button>
            )}

            {/* Parent notes */}
            {block.parent_notes && (
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  "{block.parent_notes}"
                </p>
              </div>
            )}

            {/* Feedback display if already given */}
            {block.feedback && (
              <div className={`flex items-center gap-2 text-sm ${block.feedback === 'positive' ? 'text-green-600' : 'text-orange-600'}`}>
                {block.feedback === 'positive' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                <span>{block.feedback === 'positive' ? 'Nobel loved it!' : 'Needs adjustment'}</span>
              </div>
            )}

            {/* Action buttons */}
            {!isDone && !isSkipped && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAction('done')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {loadingAction === 'done' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Done</span>
                </button>

                <button
                  onClick={() => handleAction('skip')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loadingAction === 'skip' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SkipForward className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Skip</span>
                </button>

                <button
                  onClick={() => handleAction('regenerate')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {loadingAction === 'regenerate' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Feedback prompt (shown briefly after marking done) */}
            {showFeedback && (
              <div className="flex gap-2 pt-2 animate-fade-in">
                <span className="text-sm text-gray-500 self-center">How did it go?</span>
                <button
                  onClick={() => handleFeedback('positive')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">He loved it</span>
                </button>
                <button
                  onClick={() => handleFeedback('negative')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">Too hard/boring</span>
                </button>
              </div>
            )}

            {/* Status indicator for completed/skipped */}
            {(isDone || isSkipped) && !showFeedback && (
              <div className="flex items-center gap-2 pt-2">
                <span
                  className={`text-sm ${
                    isDone ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {isDone ? '✓ Completed' : '⏭ Skipped'}
                  {block.completed_at && (
                    <span className="text-gray-400 ml-2">
                      at {new Date(block.completed_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-3 top-3">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}
