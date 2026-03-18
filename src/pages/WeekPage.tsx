import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sun,
  Book,
  Utensils,
  Moon,
  Music,
  Palette,
  Calculator,
  Globe,
  Dumbbell,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';

// Mock week schedule data
interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  duration: string;
  category: 'morning' | 'learning' | 'meal' | 'play' | 'rest';
  icon: string;
  isCompleted: boolean;
  learningArea?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayShort: string;
  isToday: boolean;
  items: ScheduleItem[];
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  morning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  learning: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  meal: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  play: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  rest: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  book: Book,
  utensils: Utensils,
  moon: Moon,
  music: Music,
  palette: Palette,
  calculator: Calculator,
  globe: Globe,
  dumbbell: Dumbbell,
};

// Generate mock week data
const generateMockWeek = (): DaySchedule[] => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const days: DaySchedule[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const isToday = date.toDateString() === today.toDateString();

    days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: dayNames[i],
      dayShort: dayShorts[i],
      isToday,
      items: generateDayItems(i, isToday),
    });
  }

  return days;
};

const generateDayItems = (dayIndex: number, isToday: boolean): ScheduleItem[] => {
  // Different schedules for each day
  const schedules: ScheduleItem[][] = [
    // Monday
    [
      { id: 'm1', time: '7:00 AM', title: 'Wake Up & Morning Routine', duration: '30 min', category: 'morning', icon: 'sun', isCompleted: true },
      { id: 'm2', time: '7:30 AM', title: 'Breakfast', duration: '30 min', category: 'meal', icon: 'utensils', isCompleted: true },
      { id: 'm3', time: '8:00 AM', title: 'Math: Counting & Patterns', duration: '45 min', category: 'learning', icon: 'calculator', isCompleted: true, learningArea: 'Math' },
      { id: 'm4', time: '9:00 AM', title: 'Free Play / Building Blocks', duration: '45 min', category: 'play', icon: 'palette', isCompleted: true },
      { id: 'm5', time: '10:00 AM', title: 'Reading Time: Maps Book', duration: '30 min', category: 'learning', icon: 'book', isCompleted: false, learningArea: 'Reading' },
      { id: 'm6', time: '12:00 PM', title: 'Lunch', duration: '45 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'm7', time: '1:00 PM', title: 'Quiet Time / Rest', duration: '1 hr', category: 'rest', icon: 'moon', isCompleted: false },
      { id: 'm8', time: '3:00 PM', title: 'Geography Activity', duration: '45 min', category: 'learning', icon: 'globe', isCompleted: false, learningArea: 'Geography' },
      { id: 'm9', time: '5:00 PM', title: 'Outdoor Play', duration: '1 hr', category: 'play', icon: 'dumbbell', isCompleted: false },
    ],
    // Tuesday
    [
      { id: 't1', time: '7:00 AM', title: 'Wake Up & Morning Routine', duration: '30 min', category: 'morning', icon: 'sun', isCompleted: false },
      { id: 't2', time: '7:30 AM', title: 'Breakfast', duration: '30 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 't3', time: '8:00 AM', title: 'Amharic Practice', duration: '30 min', category: 'learning', icon: 'book', isCompleted: false, learningArea: 'Amharic' },
      { id: 't4', time: '9:00 AM', title: 'Art & Creativity', duration: '45 min', category: 'play', icon: 'palette', isCompleted: false },
      { id: 't5', time: '10:00 AM', title: 'Science: Animals', duration: '45 min', category: 'learning', icon: 'globe', isCompleted: false, learningArea: 'Science' },
      { id: 't6', time: '12:00 PM', title: 'Lunch', duration: '45 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 't7', time: '1:00 PM', title: 'Quiet Time / Rest', duration: '1 hr', category: 'rest', icon: 'moon', isCompleted: false },
      { id: 't8', time: '3:00 PM', title: 'Music & Movement', duration: '30 min', category: 'play', icon: 'music', isCompleted: false },
      { id: 't9', time: '4:00 PM', title: 'Math Games', duration: '30 min', category: 'learning', icon: 'calculator', isCompleted: false, learningArea: 'Math' },
    ],
    // Wednesday
    [
      { id: 'w1', time: '7:00 AM', title: 'Wake Up & Morning Routine', duration: '30 min', category: 'morning', icon: 'sun', isCompleted: false },
      { id: 'w2', time: '7:30 AM', title: 'Breakfast', duration: '30 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'w3', time: '8:00 AM', title: 'Reading: Challenge Book', duration: '45 min', category: 'learning', icon: 'book', isCompleted: false, learningArea: 'Reading' },
      { id: 'w4', time: '9:00 AM', title: 'Building & Engineering', duration: '45 min', category: 'play', icon: 'palette', isCompleted: false },
      { id: 'w5', time: '10:30 AM', title: 'Library Visit', duration: '1.5 hr', category: 'learning', icon: 'book', isCompleted: false },
      { id: 'w6', time: '12:30 PM', title: 'Lunch', duration: '45 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'w7', time: '1:30 PM', title: 'Quiet Time / Rest', duration: '1 hr', category: 'rest', icon: 'moon', isCompleted: false },
      { id: 'w8', time: '3:00 PM', title: 'Vocabulary Games', duration: '30 min', category: 'learning', icon: 'book', isCompleted: false, learningArea: 'Vocabulary' },
      { id: 'w9', time: '4:00 PM', title: 'Park Time', duration: '1.5 hr', category: 'play', icon: 'dumbbell', isCompleted: false },
    ],
    // Thursday
    [
      { id: 'th1', time: '7:00 AM', title: 'Wake Up & Morning Routine', duration: '30 min', category: 'morning', icon: 'sun', isCompleted: false },
      { id: 'th2', time: '7:30 AM', title: 'Breakfast', duration: '30 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'th3', time: '8:00 AM', title: 'Math: Addition Practice', duration: '45 min', category: 'learning', icon: 'calculator', isCompleted: false, learningArea: 'Math' },
      { id: 'th4', time: '9:00 AM', title: 'Puzzle Time', duration: '30 min', category: 'play', icon: 'palette', isCompleted: false },
      { id: 'th5', time: '10:00 AM', title: 'Amharic Stories', duration: '45 min', category: 'learning', icon: 'book', isCompleted: false, learningArea: 'Amharic' },
      { id: 'th6', time: '12:00 PM', title: 'Lunch', duration: '45 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'th7', time: '1:00 PM', title: 'Quiet Time / Rest', duration: '1 hr', category: 'rest', icon: 'moon', isCompleted: false },
      { id: 'th8', time: '3:00 PM', title: 'Science Experiment', duration: '45 min', category: 'learning', icon: 'globe', isCompleted: false, learningArea: 'Science' },
      { id: 'th9', time: '4:30 PM', title: 'Free Play', duration: '1 hr', category: 'play', icon: 'music', isCompleted: false },
    ],
    // Friday
    [
      { id: 'f1', time: '7:00 AM', title: 'Wake Up & Morning Routine', duration: '30 min', category: 'morning', icon: 'sun', isCompleted: false },
      { id: 'f2', time: '7:30 AM', title: 'Breakfast', duration: '30 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'f3', time: '8:00 AM', title: 'Weekly Review: All Skills', duration: '45 min', category: 'learning', icon: 'book', isCompleted: false },
      { id: 'f4', time: '9:00 AM', title: 'Creative Art Project', duration: '1 hr', category: 'play', icon: 'palette', isCompleted: false },
      { id: 'f5', time: '10:30 AM', title: 'Assessment Time', duration: '30 min', category: 'learning', icon: 'calculator', isCompleted: false },
      { id: 'f6', time: '12:00 PM', title: 'Lunch', duration: '45 min', category: 'meal', icon: 'utensils', isCompleted: false },
      { id: 'f7', time: '1:00 PM', title: 'Movie / Quiet Time', duration: '1.5 hr', category: 'rest', icon: 'moon', isCompleted: false },
      { id: 'f8', time: '3:00 PM', title: 'Family Activity', duration: '2 hr', category: 'play', icon: 'dumbbell', isCompleted: false },
    ],
  ];

  return schedules[dayIndex] || [];
};

export default function WeekPage() {
  const [weekData, setWeekData] = useState<DaySchedule[]>(generateMockWeek);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = weekData.findIndex((d) => d.isToday);
    return today >= 0 ? today : 0;
  });

  const currentDay = weekData[selectedDay];

  const weekStats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    let learningMinutes = 0;
    let playMinutes = 0;

    weekData.forEach((day) => {
      day.items.forEach((item) => {
        totalItems++;
        if (item.isCompleted) completedItems++;

        const minutes = parseInt(item.duration) || 0;
        if (item.category === 'learning') learningMinutes += minutes;
        if (item.category === 'play') playMinutes += minutes;
      });
    });

    return { totalItems, completedItems, learningMinutes, playMinutes };
  }, [weekData]);

  const toggleItemComplete = (itemId: string) => {
    setWeekData((prev) =>
      prev.map((day, idx) =>
        idx === selectedDay
          ? {
              ...day,
              items: day.items.map((item) =>
                item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
              ),
            }
          : day
      )
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <LayoutGrid className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text">Week View</h1>
          <p className="text-text-muted">
            {weekData[0]?.date} - {weekData[4]?.date}
          </p>
        </div>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="text-2xl font-bold text-blue-700">
            {Math.round(weekStats.learningMinutes / 60)}h
          </div>
          <div className="text-xs text-blue-600">Learning Time</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
          <div className="text-2xl font-bold text-purple-700">
            {Math.round(weekStats.playMinutes / 60)}h
          </div>
          <div className="text-xs text-purple-600">Play Time</div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {weekData.map((day, idx) => (
          <button
            key={day.dayName}
            onClick={() => setSelectedDay(idx)}
            className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${
              selectedDay === idx
                ? 'bg-primary text-white border-primary shadow-md'
                : day.isToday
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface border-border text-text-muted hover:bg-slate-50'
            }`}
          >
            <span className="text-xs font-medium">{day.dayShort}</span>
            <span className="text-lg font-bold">{day.date.split(' ')[1]}</span>
            {day.isToday && selectedDay !== idx && (
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />
            )}
          </button>
        ))}
      </div>

      {/* Selected Day Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDay((prev) => Math.max(0, prev - 1))}
            disabled={selectedDay === 0}
            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </button>
          <h2 className="text-lg font-semibold text-text">
            {currentDay.dayName}
            {currentDay.isToday && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                Today
              </span>
            )}
          </h2>
          <button
            onClick={() => setSelectedDay((prev) => Math.min(4, prev + 1))}
            disabled={selectedDay === 4}
            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        <div className="text-sm text-text-muted">
          {currentDay.items.filter((i) => i.isCompleted).length}/{currentDay.items.length} done
        </div>
      </div>

      {/* Day Schedule */}
      <div className="space-y-2">
        {currentDay.items.map((item) => {
          const colors = categoryColors[item.category];
          const IconComponent = iconMap[item.icon] || Clock;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                item.isCompleted
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : `${colors.bg} ${colors.border}`
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleItemComplete(item.id)}
                className="flex-shrink-0"
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className={`w-6 h-6 ${colors.text}`} />
                )}
              </button>

              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.isCompleted ? 'bg-slate-200' : 'bg-white/50'
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 ${item.isCompleted ? 'text-slate-500' : colors.text}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium ${
                      item.isCompleted ? 'line-through text-text-muted' : 'text-text'
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.learningArea && !item.isCompleted && (
                    <span className="px-2 py-0.5 bg-white/60 text-xs rounded-full text-text-muted">
                      {item.learningArea}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                  <span>•</span>
                  <span>{item.duration}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-surface border border-border rounded-xl">
        <h3 className="text-sm font-medium text-text mb-3">Color Legend</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(categoryColors).map(([category, colors]) => (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.bg} ${colors.border} border`} />
              <span className="text-xs text-text-muted capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
