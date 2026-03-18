import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, SkipForward, RefreshCw, Loader2 } from 'lucide-react';
import type { TimeBlock, TimeBlockCategory } from '../types/database';

// Category configuration
const CATEGORY_CONFIG: Record<TimeBlockCategory, { emoji: string; color: string; label: string }> = {
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
};

interface TimeBlockCardProps {
  block: TimeBlock;
  isActive?: boolean;
  onMarkDone: (id: string) => Promise<void>;
  onMarkSkipped: (id: string) => Promise<void>;
  onRegenerate: (id: string) => Promise<void>;
}

function formatTime(time: string): string {
  // Convert "09:00" to "9:00 AM"
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Parse activity name with format "[Activity Type] - [Specific Activity]"
function parseActivityName(name: string): { activityType: string | null; activityName: string } {
  if (name.includes(' - ')) {
    const [type, ...rest] = name.split(' - ');
    return {
      activityType: type.trim(),
      activityName: rest.join(' - ').trim(),
    };
  }
  return { activityType: null, activityName: name };
}

// Check if this is a meal block (Lunch/Dinner) that should hide description
function isMealBlock(category: string): boolean {
  return category === 'lunch' || category === 'dinner';
}

// Get color for activity type label
function getActivityTypeColor(activityType: string): string {
  const typeColors: Record<string, string> = {
    'Group Play Time': '#F5A623',
    'Independent Play': '#50C878',
    'Focused Learning': '#4A90D9',
    'Outdoor Time': '#87CEEB',
    'Creative Time': '#E91E63',
    'Amharic Practice': '#2ECC71',
    'Rest Time': '#B39DDB',
    'Reading Time': '#5C6BC0',
    'Routine': '#9E9E9E',
  };
  return typeColors[activityType] || '#9E9E9E';
}

export default function TimeBlockCard({
  block,
  isActive = false,
  onMarkDone,
  onMarkSkipped,
  onRegenerate,
}: TimeBlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'done' | 'skip' | 'regenerate' | null>(null);

  const config = CATEGORY_CONFIG[block.category as TimeBlockCategory] || {
    emoji: '📌',
    color: '#9E9E9E',
    label: block.category,
  };

  const isDone = block.status === 'done';
  const isSkipped = block.status === 'skipped';

  const handleAction = async (action: 'done' | 'skip' | 'regenerate') => {
    setIsLoading(true);
    setLoadingAction(action);
    try {
      if (action === 'done') await onMarkDone(block.id);
      else if (action === 'skip') await onMarkSkipped(block.id);
      else if (action === 'regenerate') await onRegenerate(block.id);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={`
        relative bg-surface rounded-xl border overflow-hidden transition-all duration-200
        ${isActive ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border'}
        ${isDone ? 'opacity-60' : ''}
        ${isSkipped ? 'opacity-40' : ''}
      `}
    >
      {/* Category color stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: config.color }}
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
            <div className="text-xs text-text-muted">
              {formatTime(block.start_time)}
            </div>
            <div className="text-xs text-text-muted">
              {formatTime(block.end_time)}
            </div>
          </div>

          {/* Activity info */}
          <div className="flex-1 min-w-0">
            {(() => {
              const { activityType, activityName } = parseActivityName(block.activity_name);
              const isMeal = isMealBlock(block.category);

              return (
                <>
                  {/* Activity Type Label (if present) */}
                  {activityType && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: getActivityTypeColor(activityType) }}
                    >
                      {activityType}
                    </span>
                  )}

                  {/* Activity Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-semibold text-text truncate ${
                        isSkipped ? 'line-through' : ''
                      }`}
                    >
                      {activityName}
                    </h3>
                    {isDone && (
                      <span className="flex-shrink-0 text-success">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Description (hidden for meal blocks) */}
                  {!isMeal && block.description && (
                    <p className="text-sm text-text-muted line-clamp-2">
                      {block.description}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Expand button */}
          <button
            className="flex-shrink-0 p-1 text-text-muted hover:text-text transition-colors"
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
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            {/* Materials needed */}
            {block.materials_needed && block.materials_needed.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                  Materials Needed
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {block.materials_needed.map((material, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-background text-sm text-text rounded-full"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning objective (Parent note) - hidden for meal blocks */}
            {block.learning_objective && !isMealBlock(block.category) && (
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                  Parent Note
                </h4>
                <p className="text-sm text-text">{block.learning_objective}</p>
              </div>
            )}

            {/* Difficulty badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Difficulty:
              </span>
              <span
                className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${block.difficulty === 'easy' ? 'bg-success/20 text-success' : ''}
                  ${block.difficulty === 'moderate' ? 'bg-accent/20 text-accent-dark' : ''}
                  ${block.difficulty === 'challenging' ? 'bg-primary/20 text-primary' : ''}
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
                    className="px-2 py-0.5 bg-primary/10 text-xs text-primary rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Parent notes */}
            {block.parent_notes && (
              <div className="p-2 bg-background rounded-lg">
                <p className="text-sm text-text-muted italic">
                  "{block.parent_notes}"
                </p>
              </div>
            )}

            {/* Action buttons */}
            {!isDone && !isSkipped && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAction('done')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors disabled:opacity-50"
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-text-muted/10 text-text-muted rounded-lg hover:bg-text-muted/20 transition-colors disabled:opacity-50"
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
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {loadingAction === 'regenerate' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Status indicator for completed/skipped */}
            {(isDone || isSkipped) && (
              <div className="flex items-center gap-2 pt-2">
                <span
                  className={`text-sm ${
                    isDone ? 'text-success' : 'text-text-muted'
                  }`}
                >
                  {isDone ? '✓ Completed' : '⏭ Skipped'}
                  {block.completed_at && (
                    <span className="text-text-muted ml-2">
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
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>
      )}
    </div>
  );
}
