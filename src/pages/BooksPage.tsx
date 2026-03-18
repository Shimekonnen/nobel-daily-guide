import { useState } from 'react';
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
} from 'lucide-react';

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
  isRead: boolean;
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

const LIBRARY_SEARCH_BASE = 'https://librarypoint.bibliocommons.com/v2/search?query=';
const LIBRARY_SEARCH_SUFFIX = '&searchType=smart';

const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Maps and Geography',
    author: 'Ken Jennings',
    category: 'this-week',
    categoryLabel: "This Week's Read",
    coverEmoji: '🗺️',
    description:
      'Explore the world through maps! Learn about continents, oceans, and how to read different types of maps.',
    learningConnection: 'Connects to our geography exploration this week',
    pageCount: 48,
    readingTime: '20-25 min',
    isRead: false,
    availabilityHint: 'Check CRRL Library',
  },
  {
    id: 'book-2',
    title: 'The Magic School Bus: Lost in the Solar System',
    author: 'Joanna Cole',
    category: 'challenge',
    categoryLabel: 'Challenge Read',
    coverEmoji: '🚀',
    description:
      'Join Ms. Frizzle and her class on an adventure through space! Learn about planets, stars, and the solar system.',
    learningConnection: 'Advanced vocabulary and science concepts',
    pageCount: 40,
    readingTime: '25-30 min',
    isRead: false,
    availabilityHint: 'Check CRRL Library',
  },
  {
    id: 'book-3',
    title: 'Dragons Love Tacos',
    author: 'Adam Rubin',
    category: 'fun',
    categoryLabel: 'Just for Fun',
    coverEmoji: '🐉',
    description:
      "A hilarious story about dragons who love tacos - but watch out for the spicy salsa!",
    learningConnection: 'Humor, cause and effect, reading for pleasure',
    pageCount: 32,
    readingTime: '10-15 min',
    isRead: true,
    availabilityHint: 'Check CRRL Library',
  },
  {
    id: 'book-4',
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
    isRead: false,
    availabilityHint: 'Check CRRL Library',
  },
  {
    id: 'book-5',
    title: 'National Geographic Little Kids First Big Book of Animals',
    author: 'Catherine D. Hughes',
    category: 'this-week',
    categoryLabel: "This Week's Read",
    coverEmoji: '🦁',
    description:
      'Meet amazing animals from around the world! Beautiful photos and fun facts about creatures big and small.',
    learningConnection: 'Science vocabulary and animal classification',
    pageCount: 128,
    readingTime: '30+ min (sections)',
    isRead: false,
    availabilityHint: 'Check CRRL Library',
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

  const toggleBookRead = (bookId: string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, isRead: !book.isRead } : book
      )
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

  const booksRead = books.filter((b) => b.isRead).length;
  const activitiesCompleted = activities.filter((a) => a.isCompleted).length;

  return (
    <div className="flex-1 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text">Books & Activities</h1>
          <p className="text-text-muted">This week's recommendations</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-muted">Progress</div>
          <div className="text-lg font-semibold text-primary">
            {booksRead}/{books.length} read
          </div>
        </div>
      </div>

      {/* Books Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-text">This Week's Books</h2>
        </div>

        <div className="space-y-3">
          {books.map((book) => {
            const colors = categoryColors[book.category];
            return (
              <div
                key={book.id}
                className={`bg-surface rounded-2xl border border-border shadow-sm overflow-hidden transition-all ${
                  book.isRead ? 'opacity-75' : ''
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
                              book.isRead ? 'line-through' : ''
                            }`}
                          >
                            {book.title}
                          </h3>
                          <p className="text-sm text-text-muted">{book.author}</p>
                        </div>
                        <button
                          onClick={() => toggleBookRead(book.id)}
                          className="flex-shrink-0"
                          aria-label={book.isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {book.isRead ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-text-muted" />
                          )}
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

                  {/* Library Availability */}
                  <div className="mt-2">
                    <a
                      href={`${LIBRARY_SEARCH_BASE}${book.title.replace(/ /g, '+')}${LIBRARY_SEARCH_SUFFIX}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {book.availabilityHint}
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
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
        <p className="text-sm text-blue-700">
          New book and activity recommendations refresh every Monday based on Nobel's
          interests and learning progress.
        </p>
      </div>
    </div>
  );
}
