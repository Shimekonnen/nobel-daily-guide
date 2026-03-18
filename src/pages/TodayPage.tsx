import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronDown,
  Wand2,
  FileText,
} from 'lucide-react';
import TimeBlockCard from '../components/TimeBlockCard';
import {
  getTodaySchedule,
  generateAndSaveSchedule,
  updateTimeBlockStatus,
  regenerateTimeBlock,
} from '../services/scheduleService';
import { MOCK_THEME } from '../services/mockSchedule';
import type { DailyScheduleWithBlocks, TimeBlock } from '../types/database';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getCurrentTimeBlock(blocks: TimeBlock[]): string | null {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  for (const block of blocks) {
    if (currentTime >= block.start_time && currentTime < block.end_time) {
      return block.id;
    }
  }
  return null;
}

const LOADING_MESSAGES = [
  "Creating Nobel's adventure for today...",
  'Crafting exciting activities...',
  'Planning learning moments...',
  'Preparing educational fun...',
  'Designing the perfect day...',
];

export default function TodayPage() {
  const [schedule, setSchedule] = useState<DailyScheduleWithBlocks | null>(null);
  const [theme, setTheme] = useState<string>(MOCK_THEME);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (!generating) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [generating]);

  // Update active block every minute
  useEffect(() => {
    if (!schedule?.time_blocks) return;

    const updateActiveBlock = () => {
      setActiveBlockId(getCurrentTimeBlock(schedule.time_blocks));
    };

    updateActiveBlock();
    const interval = setInterval(updateActiveBlock, 60000);
    return () => clearInterval(interval);
  }, [schedule?.time_blocks]);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodaySchedule();
      setSchedule(data);
    } catch (err) {
      setError('Failed to load schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleGenerate = async (useMock: boolean = false) => {
    try {
      setShowMenu(false);
      setGenerating(true);
      setError(null);
      const result = await generateAndSaveSchedule(undefined, useMock);
      if (result) {
        setTheme(result.theme);
        await fetchSchedule();
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'ANTHROPIC_API_KEY_NOT_CONFIGURED') {
        setError('API key not configured. Use Sample Schedule instead.');
      } else {
        setError('Failed to generate schedule');
        console.error(err);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkDone = async (blockId: string) => {
    const updated = await updateTimeBlockStatus(blockId, 'done');
    if (updated && schedule) {
      setSchedule({
        ...schedule,
        time_blocks: schedule.time_blocks.map((b) =>
          b.id === blockId ? updated : b
        ),
      });
    }
  };

  const handleMarkSkipped = async (blockId: string) => {
    const updated = await updateTimeBlockStatus(blockId, 'skipped');
    if (updated && schedule) {
      setSchedule({
        ...schedule,
        time_blocks: schedule.time_blocks.map((b) =>
          b.id === blockId ? updated : b
        ),
      });
    }
  };

  const handleRegenerate = async (blockId: string) => {
    try {
      const updated = await regenerateTimeBlock(blockId);
      if (updated && schedule) {
        setSchedule({
          ...schedule,
          time_blocks: schedule.time_blocks.map((b) =>
            b.id === blockId ? updated : b
          ),
        });
      }
    } catch (err) {
      console.error('Failed to regenerate block:', err);
    }
  };

  // Schedule Actions Menu Component
  const ScheduleActionsMenu = ({ compact = false }: { compact?: boolean }) => (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={generating}
        className={`flex items-center gap-2 rounded-xl transition-colors disabled:opacity-50 ${
          compact
            ? 'p-2 text-text-muted hover:text-primary hover:bg-primary/10'
            : 'px-4 py-2 bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        {generating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : compact ? (
          <>
            <RefreshCw className="w-5 h-5" />
            <ChevronDown className="w-4 h-4" />
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Schedule</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors text-left"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-text">Generate with AI</div>
                <div className="text-xs text-text-muted">
                  Create a unique schedule using Claude AI
                </div>
              </div>
            </button>

            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors text-left"
            >
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="w-5 h-5 text-accent-dark" />
              </div>
              <div>
                <div className="font-medium text-text">Use Sample Schedule</div>
                <div className="text-xs text-text-muted">
                  Load a pre-made template (no API call)
                </div>
              </div>
            </button>
          </div>

          {schedule && (
            <div className="border-t border-border p-2">
              <p className="text-xs text-text-muted px-3 py-1">
                This will replace the current schedule
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-text-muted">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!schedule) {
    return (
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-text">Today's Schedule</h1>
              <p className="text-text-muted">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Empty state card */}
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">
            No Schedule Yet
          </h2>
          <p className="text-text-muted mb-6 max-w-sm mx-auto">
            Generate a personalized daily schedule filled with engaging activities
            for Nobel.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {generating && !error ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingMessage}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent/10 text-accent-dark rounded-xl hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
              <span>Use Sample Schedule</span>
            </button>
          </div>

          {/* Explanation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-text text-sm">Generate with AI</span>
              </div>
              <p className="text-xs text-text-muted">
                Uses Claude AI to create a unique, personalized schedule based on Nobel's
                profile, interests, and recent activities.
              </p>
            </div>
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-accent-dark" />
                <span className="font-medium text-text text-sm">Sample Schedule</span>
              </div>
              <p className="text-xs text-text-muted">
                Loads a pre-made template schedule. Good for testing or when you want
                a quick start without API calls.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Schedule view
  const completedCount = schedule.time_blocks.filter(b => b.status === 'done').length;
  const totalCount = schedule.time_blocks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex-1 pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-semibold text-text">
                {formatDate(new Date())}
              </h1>
              <p className="text-sm text-primary font-medium">{theme}</p>
            </div>
            <ScheduleActionsMenu compact />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-text-muted">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Generating overlay */}
      {generating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center p-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-lg text-text font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Schedule list */}
      <div className="p-4 space-y-3">
        {schedule.time_blocks.map((block) => (
          <TimeBlockCard
            key={block.id}
            block={block}
            isActive={block.id === activeBlockId}
            onMarkDone={handleMarkDone}
            onMarkSkipped={handleMarkSkipped}
            onRegenerate={handleRegenerate}
          />
        ))}
      </div>

      {error && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
