import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronDown,
  Wand2,
  FileText,
  Settings,
} from 'lucide-react';
import TimeBlockCard from '../components/TimeBlockCard';
import WorksheetViewer from '../components/WorksheetViewer';
import {
  getTodaySchedule,
  generateAndSaveSchedule,
  updateTimeBlockStatus,
  regenerateTimeBlock,
  updateTimeBlockFeedback,
} from '../services/scheduleService';
import { MOCK_THEME } from '../services/mockSchedule';
import type { DailyScheduleWithBlocks, TimeBlock, ParentFeedback } from '../types/database';

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

// Helper to check if a block is a structured (vs minimal) block
function isStructuredBlock(block: TimeBlock): boolean {
  if (block.display_type) {
    return block.display_type === 'structured';
  }
  // Legacy fallback: these categories are typically structured
  return ['focused_learning', 'amharic'].includes(block.category);
}

const LOADING_MESSAGES = [
  "Creating Nobel's adventure for today...",
  'Planning 3 structured activities...',
  'Selecting developmental domains...',
  'Preparing learning moments...',
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
  const [worksheetBlock, setWorksheetBlock] = useState<TimeBlock | null>(null);
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

  const handleFeedback = async (blockId: string, feedback: ParentFeedback) => {
    try {
      const updated = await updateTimeBlockFeedback(blockId, feedback);
      if (updated && schedule) {
        setSchedule({
          ...schedule,
          time_blocks: schedule.time_blocks.map((b) =>
            b.id === blockId ? updated : b
          ),
        });
      }
    } catch (err) {
      console.error('Failed to save feedback:', err);
    }
  };

  const handleViewWorksheet = (block: TimeBlock) => {
    setWorksheetBlock(block);
  };

  // Schedule Actions Menu Component
  const ScheduleActionsMenu = ({ compact = false }: { compact?: boolean }) => (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={generating}
        className={`flex items-center gap-2 rounded-xl transition-colors disabled:opacity-50 ${
          compact
            ? 'p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            : 'px-4 py-2 bg-blue-600 text-white hover:bg-blue-700'
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
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wand2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Generate with AI</div>
                <div className="text-xs text-gray-500">
                  Create a unique schedule using Claude AI
                </div>
              </div>
            </button>

            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Use Sample Schedule</div>
                <div className="text-xs text-gray-500">
                  Load a pre-made template (no API call)
                </div>
              </div>
            </button>
          </div>

          {schedule && (
            <div className="border-t border-gray-100 p-2">
              <p className="text-xs text-gray-500 px-3 py-1">
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading schedule...</p>
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
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Today's Schedule</h1>
              <p className="text-gray-500">{formatDate(new Date())}</p>
            </div>
          </div>
          <Link
            to="/settings"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        {/* Empty state card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Schedule Yet
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Generate a simplified daily schedule with just 3 structured activities plus free play time.
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
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
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
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
              <span>Use Sample Schedule</span>
            </button>
          </div>

          {/* New simplified schedule explanation */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Simplified Schedule</h3>
            <p className="text-sm text-gray-600 mb-3">
              The new schedule has only <strong>3 structured activities</strong> to focus on:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>10:30 AM</strong> — Focused Activity (main learning)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                <strong>1:00 PM</strong> — Afternoon Activity (different domain)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>3:30 PM</strong> — Amharic Practice
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Everything else (free play, lunch, rest, reading) is open time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress for structured blocks only
  const structuredBlocks = schedule.time_blocks.filter(isStructuredBlock);
  const completedStructured = structuredBlocks.filter(b => b.status === 'done').length;
  const totalStructured = structuredBlocks.length;
  const progress = totalStructured > 0 ? (completedStructured / totalStructured) * 100 : 0;

  return (
    <div className="flex-1 pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {formatDate(new Date())}
              </h1>
              <p className="text-sm text-blue-600 font-medium">{theme}</p>
            </div>
            <div className="flex items-center gap-2">
              <ScheduleActionsMenu compact />
              <Link
                to="/settings"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Progress bar - only counts structured activities */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {completedStructured}/{totalStructured} activities
            </span>
          </div>
        </div>
      </div>

      {/* Generating overlay */}
      {generating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center p-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-900 font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Schedule list */}
      <div className="p-4 space-y-2">
        {schedule.time_blocks.map((block) => (
          <TimeBlockCard
            key={block.id}
            block={block}
            isActive={block.id === activeBlockId}
            onMarkDone={handleMarkDone}
            onMarkSkipped={handleMarkSkipped}
            onRegenerate={handleRegenerate}
            onFeedback={handleFeedback}
            onViewWorksheet={handleViewWorksheet}
          />
        ))}
      </div>

      {error && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Worksheet Viewer Modal */}
      {worksheetBlock && (
        <WorksheetViewer
          block={worksheetBlock}
          onClose={() => setWorksheetBlock(null)}
        />
      )}
    </div>
  );
}
