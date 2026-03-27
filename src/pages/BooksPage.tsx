import { useState, useMemo } from 'react';
import {
  BookOpen,
  Star,
  Sparkles,
  Globe,
  Music,
  Palette,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Library,
  RefreshCw,
} from 'lucide-react';

// Book status type
type BookStatus = 'recommended' | 'reading' | 'completed';

// Mock book data
interface Book {
  id: string;
  title: string;
  author: string;
  category: 'this-week' | 'challenge' | 'fun' | 'amharic';
  categoryLabel: string;
  coverEmoji: string;
  description: string;
  learningConnection: string;
  pageCount: number;
  readingTime: string;
  status: BookStatus;
  availabilityHint: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  materials: string[];
  estimatedCost: string;
  duration: string;
  participants: string;
  learningAreas: string[];
  steps: string[];
  icon: 'palette' | 'globe' | 'music' | 'sparkles';
  isCompleted: boolean;
}

// CRRL (Central Rappahannock Regional Library) catalog search
const CRRL_SEARCH_URL = 'https://librarypoint.bibliocommons.com/v2/search?query=';
const CRRL_SEARCH_SUFFIX = '&searchType=smart';

// Get the current week's Monday and Sunday dates
function getWeekRange(): { start: Date; end: Date; weekNumber: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Calculate week number of the year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  return { start: monday, end: sunday, weekNumber };
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'The Color Monster',
    author: 'Anna Llenas',
    category: 'this-week',
    categoryLabel: 'Social-Emotional',
    coverEmoji: '🎨',
    description:
      'A monster is confused about his feelings until a little girl helps him sort them out by color. Perfect for discussing emotions!',
    learningConnection: 'Emotional awareness and identifying feelings',
    pageCount: 40,
    readingTime: '10-15 min',
    status: 'recommended',
    availabilityHint: 'Find at CRRL',
  },
  {
    id: 'book-2',
    title: 'The Feelings Book',
    author: 'Todd Parr',
    category: 'this-week',
    categoryLabel: 'Social-Emotional',
    coverEmoji: '😊',
    description:
      'Colorful illustrations showing all kinds of feelings - silly, scared, brave, and more!',
    learningConnection: 'Naming emotions and understanding they\'re all okay',
    pageCount: 32,
    readingTime: '8-10 min',
    status: 'reading',
    availabilityHint: 'Find at CRRL',
  },
  {
    id: 'book-3',
    title: 'Pete the Cat and His Magic Sunglasses',
    author: 'James Dean',
    category: 'fun',
    categoryLabel: 'Just for Fun',
    coverEmoji: '😎',
    description:
      'Pete the Cat is in a bad mood until he gets some magic sunglasses that help him see things differently!',
    learningConnection: 'Perspective-taking and positive thinking',
    pageCount: 32,
    readingTime: '10-12 min',
    status: 'recommended',
    availabilityHint: 'Find at CRRL',
  },
  {
    id: 'book-4',
    title: 'Not a Box',
    author: 'Antoinette Portis',
    category: 'challenge',
    categoryLabel: 'Creative Thinking',
    coverEmoji: '📦',
    description:
      'A rabbit shows that a box can be anything you imagine - a race car, a robot, a mountain!',
    learningConnection: 'Creative imagination and open-ended play',
    pageCount: 32,
    readingTime: '5-8 min',
    status: 'recommended',
    availabilityHint: 'Find at CRRL',
  },
  {
    id: 'book-5',
    title: 'ፊደል መማሪያ (Fidel Learning)',
    author: 'Ethiopian Children\'s Books',
    category: 'amharic',
    categoryLabel: 'Amharic',
    coverEmoji: '🇪🇹',
    description:
      'Practice reading Amharic letters and simple words with colorful illustrations.',
    learningConnection: 'Amharic literacy and cultural connection',
    pageCount: 24,
    readingTime: '15-20 min',
    status: 'completed',
    availabilityHint: 'Find at CRRL',
  },
];

const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    title: 'DIY World Map Puzzle',
    description:
      'Create your own continent puzzle using cardboard and paint. Perfect for learning geography hands-on!',
    materials: [
      'Large cardboard box',
      'World map printout',
      'Scissors',
      'Paint/markers',
      'Glue',
    ],
    estimatedCost: 'Free - $5',
    duration: '45-60 min',
    participants: 'Parent + child',
    learningAreas: ['Geography', 'Fine Motor', 'Art'],
    steps: [
      'Print or draw a simple world map',
      'Glue map onto cardboard',
      'Cut out continents as puzzle pieces',
      'Color each continent a different color',
      'Practice putting the puzzle together!',
    ],
    icon: 'globe',
    isCompleted: false,
  },
  {
    id: 'activity-2',
    title: 'Kitchen Math: Measuring Fun',
    description:
      'Make a simple recipe together while practicing measuring, counting, and fractions.',
    materials: [
      'Measuring cups/spoons',
      'Simple recipe (smoothie, trail mix)',
      'Ingredients',
      'Mixing bowls',
    ],
    estimatedCost: '$5-10',
    duration: '30-45 min',
    participants: 'Parent + child',
    learningAreas: ['Math', 'Following directions', 'Life skills'],
    steps: [
      'Choose a simple recipe together',
      'Read the recipe aloud',
      'Measure each ingredient carefully',
      'Count items and practice fractions (half cup, quarter teaspoon)',
      'Mix and enjoy your creation!',
    ],
    icon: 'sparkles',
    isCompleted: true,
  },
  {
    id: 'activity-3',
    title: 'Sound Safari Walk',
    description:
      'Take a nature walk and collect sounds! Listen for birds, cars, wind, and more.',
    materials: [
      'Paper and pencil',
      'Optional: phone for recording',
      'Comfortable walking shoes',
    ],
    estimatedCost: 'Free',
    duration: '30 min',
    participants: 'Family',
    learningAreas: ['Science', 'Listening', 'Nature observation'],
    steps: [
      'Go for a walk in your neighborhood or park',
      'Stop every minute and listen carefully',
      'Draw or write what sounds you hear',
      'Count how many different sounds you found',
      'At home, try to imitate the sounds you heard',
    ],
    icon: 'music',
    isCompleted: false,
  },
];

const categoryColors: Record<Book['category'], { bg: string; text: string; border: string }> = {
  'this-week': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  challenge: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  fun: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  amharic: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const activityIcons = {
  palette: Palette,
  globe: Globe,
  music: Music,
  sparkles: Sparkles,
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // Calculate current week range
  const weekRange = useMemo(() => getWeekRange(), []);
  const weekLabel = `${formatDateShort(weekRange.start)} – ${formatDateShort(weekRange.end)}`;

  const cycleBookStatus = (bookId: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== bookId) return book;
        const statusOrder: BookStatus[] = ['recommended', 'reading', 'completed'];
        const currentIndex = statusOrder.indexOf(book.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...book, status: nextStatus };
      })
    );
  };

  const toggleActivityComplete = (activityId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? { ...activity, isCompleted: !activity.isCompleted }
          : activity
      )
    );
  };

  const booksCompleted = books.filter((b) => b.status === 'completed').length;
  const booksReading = books.filter((b) => b.status === 'reading').length;
  const activitiesCompleted = activities.filter((a) => a.isCompleted).length;

  return (
    <div className="flex-1 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text">Books & Activities</h1>
          <p className="text-text-muted flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Week of {weekLabel}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-muted">Progress</div>
          <div className="text-lg font-semibold text-primary">
            {booksCompleted}/{books.length} done
          </div>
          {booksReading > 0 && (
            <div className="text-xs text-amber-600">{booksReading} reading</div>
          )}
        </div>
      </div>

      {/* CRRL Library Link */}
      <a
        href="https://librarypoint.bibliocommons.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
      >
        <Library className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <span className="font-medium text-blue-800">CRRL Library Catalog</span>
          <span className="text-sm text-blue-600 ml-2">Search & reserve books</span>
        </div>
        <ExternalLink className="w-4 h-4 text-blue-400" />
      </a>

      {/* Books Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-text">This Week's Books</h2>
        </div>

        <div className="space-y-3">
          {books.map((book) => {
            const colors = categoryColors[book.category];
            const statusConfig = {
              recommended: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100', label: 'To Read' },
              reading: { icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Reading' },
              completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100', label: 'Done' },
            };
            const currentStatus = statusConfig[book.status];
            const StatusIcon = currentStatus.icon;

            return (
              <div
                key={book.id}
                className={`bg-surface rounded-2xl border border-border shadow-sm overflow-hidden transition-all ${
                  book.status === 'completed' ? 'opacity-75' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Book Cover Emoji */}
                    <div className="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-3xl shadow-inner">
                      {book.coverEmoji}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3
                            className={`font-semibold text-text ${
                              book.status === 'completed' ? 'line-through' : ''
                            }`}
                          >
                            {book.title}
                          </h3>
                          <p className="text-sm text-text-muted">{book.author}</p>
                        </div>
                        {/* Status Selector Button */}
                        <button
                          onClick={() => cycleBookStatus(book.id)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${currentStatus.bg} ${currentStatus.color}`}
                          aria-label={`Current status: ${currentStatus.label}. Tap to change.`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span>{currentStatus.label}</span>
                        </button>
                      </div>

                      {/* Category Badge */}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border mb-2`}
                      >
                        {book.categoryLabel}
                      </span>

                      {/* Description */}
                      <p className="text-sm text-text-muted line-clamp-2 mb-2">
                        {book.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {book.readingTime}
                        </span>
                        <span>{book.pageCount} pages</span>
                      </div>
                    </div>
                  </div>

                  {/* Learning Connection */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-text-muted">{book.learningConnection}</span>
                    </div>
                  </div>

                  {/* Library Search Link */}
                  <div className="mt-2">
                    <a
                      href={`${CRRL_SEARCH_URL}${encodeURIComponent(book.title)}${CRRL_SEARCH_SUFFIX}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Library className="w-3 h-3" />
                      {book.availabilityHint}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activities Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-text">Weekly Activities</h2>
          </div>
          <span className="text-sm text-text-muted">
            {activitiesCompleted}/{activities.length} done
          </span>
        </div>

        <div className="space-y-3">
          {activities.map((activity) => {
            const IconComponent = activityIcons[activity.icon];
            const isExpanded = expandedActivity === activity.id;

            return (
              <div
                key={activity.id}
                className={`bg-surface rounded-2xl border border-border shadow-sm overflow-hidden ${
                  activity.isCompleted ? 'opacity-75' : ''
                }`}
              >
                <div className="p-4">
                  {/* Activity Header */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        activity.isCompleted
                          ? 'bg-green-100'
                          : 'bg-gradient-to-br from-purple-100 to-pink-100'
                      }`}
                    >
                      {activity.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <IconComponent className="w-6 h-6 text-purple-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-semibold text-text ${
                            activity.isCompleted ? 'line-through' : ''
                          }`}
                        >
                          {activity.title}
                        </h3>
                        <button
                          onClick={() => toggleActivityComplete(activity.id)}
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-colors"
                          style={{
                            backgroundColor: activity.isCompleted ? '#dcfce7' : 'transparent',
                            borderColor: activity.isCompleted ? '#86efac' : '#e5e7eb',
                            color: activity.isCompleted ? '#15803d' : '#6b7280',
                          }}
                        >
                          {activity.isCompleted ? 'Done!' : 'Mark done'}
                        </button>
                      </div>

                      <p className="text-sm text-text-muted mt-1">{activity.description}</p>

                      {/* Quick Info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {activity.estimatedCost}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {activity.participants}
                        </span>
                      </div>

                      {/* Learning Areas Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activity.learningAreas.map((area) => (
                          <span
                            key={area}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() =>
                      setExpandedActivity(isExpanded ? null : activity.id)
                    }
                    className="w-full mt-3 pt-3 border-t border-border flex items-center justify-center gap-1 text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide details</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>View materials & steps</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-4 animate-[fade-in_0.2s_ease-out]">
                      {/* Materials */}
                      <div>
                        <h4 className="text-sm font-medium text-text mb-2">
                          Materials Needed:
                        </h4>
                        <ul className="grid grid-cols-2 gap-1">
                          {activity.materials.map((material, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-text-muted flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0" />
                              {material}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="text-sm font-medium text-text mb-2">Steps:</h4>
                        <ol className="space-y-2">
                          {activity.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-text-muted">
                              <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-medium">
                                {idx + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Refresh Note */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 justify-center">
          <RefreshCw className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            Recommendations refresh <strong>every Monday</strong> based on Nobel's weekly developmental focus.
          </p>
        </div>
        <p className="text-xs text-blue-500 mt-1 text-center">
          Click "Find at CRRL" to check availability and reserve books at your local library.
        </p>
      </div>
    </div>
  );
}
