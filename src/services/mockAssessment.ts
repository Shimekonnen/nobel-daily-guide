// Mock Assessment Data
// Based on Appendix B from requirements

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  type: 'multiple_choice' | 'open_response';
  options?: string[];
  correct_answer: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  skill_tags: string[];
  visual_description: string;
  hint?: string; // Optional learning hint shown after incorrect answer
}

export interface MockAssessment {
  session_theme: string;
  skill_area: 'reading' | 'math' | 'reasoning' | 'amharic' | 'vocabulary';
  level: number;
  questions: AssessmentQuestion[];
}

// Space Explorer Mission - Math Level 5 (from Appendix B)
export const MOCK_MATH_ASSESSMENT: MockAssessment = {
  session_theme: "Space Explorer Mission",
  skill_area: "math",
  level: 5,
  questions: [
    {
      id: 1,
      question_text: "The rocket needs exactly 15 fuel pods to launch. You loaded 8 pods. How many more do you need?",
      type: "multiple_choice",
      options: ["6", "7", "8", "5"],
      correct_answer: "7",
      difficulty: "easy",
      skill_tags: ["subtraction", "word-problems"],
      visual_description: "A colorful rocket ship with fuel pods beside it",
      hint: "Try counting up from 8 until you reach 15!"
    },
    {
      id: 2,
      question_text: "Count the craters: ⭕⭕⭕⭕⭕⭕⭕ and ⭕⭕⭕⭕⭕. How many craters are there in total?",
      type: "multiple_choice",
      options: ["10", "11", "12", "13"],
      correct_answer: "12",
      difficulty: "easy",
      skill_tags: ["counting", "addition"],
      visual_description: "Moon surface with crater circles",
      hint: "Count the first group (7), then keep counting with the second group!"
    },
    {
      id: 3,
      question_text: "The space station has 3 rooms. Each room has 4 astronauts. How many astronauts are there in total?",
      type: "multiple_choice",
      options: ["7", "10", "12", "15"],
      correct_answer: "12",
      difficulty: "moderate",
      skill_tags: ["multiplication-concept", "counting-groups"],
      visual_description: "Space station with rooms showing astronauts",
      hint: "Try adding 4 + 4 + 4 — one group of 4 for each room!"
    },
    {
      id: 4,
      question_text: "Planet A is 24 light-years away. Planet B is 18 light-years away. How much farther is Planet A?",
      type: "multiple_choice",
      options: ["4", "5", "6", "42"],
      correct_answer: "6",
      difficulty: "moderate",
      skill_tags: ["subtraction", "double-digit", "comparison"],
      visual_description: "Two planets with distance markers",
      hint: "Try counting backwards from 24 to 18!"
    },
    {
      id: 5,
      question_text: "The alien collected stars in this pattern: 2, 4, 6, 8, ___. What comes next?",
      type: "multiple_choice",
      options: ["9", "10", "11", "12"],
      correct_answer: "10",
      difficulty: "moderate",
      skill_tags: ["patterns", "skip-counting"],
      visual_description: "Friendly alien with glowing stars",
      hint: "Look at how much each number grows — we're counting by 2s!"
    },
    {
      id: 6,
      question_text: "Earth has 156 satellites. Mars has 100 fewer. How many satellites does Mars have?",
      type: "multiple_choice",
      options: ["56", "256", "46", "156"],
      correct_answer: "56",
      difficulty: "hard",
      skill_tags: ["subtraction", "three-digit", "word-problems"],
      visual_description: "Earth and Mars with satellites orbiting",
      hint: "When we take away 100 from a number, only the hundreds place changes!"
    }
  ]
};

// Jungle Book Explorers - Reading Level 6
export const MOCK_READING_ASSESSMENT: MockAssessment = {
  session_theme: "Jungle Book Explorers",
  skill_area: "reading",
  level: 6,
  questions: [
    {
      id: 1,
      question_text: "Read this: 'The monkey swung from branch to branch, searching for ripe bananas.' What was the monkey looking for?",
      type: "multiple_choice",
      options: ["Leaves", "Bananas", "Bugs", "Water"],
      correct_answer: "Bananas",
      difficulty: "easy",
      skill_tags: ["comprehension", "detail-finding"],
      visual_description: "A playful monkey in jungle trees",
      hint: "Look for the word 'searching for' — what comes right after it?"
    },
    {
      id: 2,
      question_text: "What does 'enormous' mean in this sentence: 'The elephant was enormous compared to the tiny mouse.'",
      type: "multiple_choice",
      options: ["Very small", "Very big", "Very fast", "Very quiet"],
      correct_answer: "Very big",
      difficulty: "easy",
      skill_tags: ["vocabulary", "context-clues"],
      visual_description: "Big elephant next to small mouse",
      hint: "The sentence compares to 'tiny' — enormous must be the opposite!"
    },
    {
      id: 3,
      question_text: "'The parrot flapped its colorful wings and flew high above the trees.' Where did the parrot go?",
      type: "multiple_choice",
      options: ["Under the water", "Into a cave", "Above the trees", "Underground"],
      correct_answer: "Above the trees",
      difficulty: "moderate",
      skill_tags: ["comprehension", "spatial-understanding"],
      visual_description: "Colorful parrot flying over jungle canopy",
      hint: "Look for the words that tell us direction — 'high' and what else?"
    },
    {
      id: 4,
      question_text: "'The tiger crouched low in the grass, eyes fixed on the deer.' Why was the tiger crouching?",
      type: "multiple_choice",
      options: ["It was tired", "It was hunting", "It was scared", "It was sleeping"],
      correct_answer: "It was hunting",
      difficulty: "moderate",
      skill_tags: ["inference", "cause-effect"],
      visual_description: "Tiger hiding in tall grass",
      hint: "Think about why a tiger would hide and watch a deer very closely..."
    },
    {
      id: 5,
      question_text: "'The rain poured down, turning the path into a muddy river. The explorers had to wait inside their tent.' What caused the explorers to wait?",
      type: "multiple_choice",
      options: ["They were hungry", "The rain made it muddy", "They were lost", "It was nighttime"],
      correct_answer: "The rain made it muddy",
      difficulty: "moderate",
      skill_tags: ["cause-effect", "comprehension"],
      visual_description: "Explorers in tent with rain outside",
      hint: "What happened first in the story? That's usually the cause!"
    },
    {
      id: 6,
      question_text: "'The ancient map showed a path through the jungle to a hidden waterfall. Only those brave enough to follow it would discover the treasure.' What do you think the explorers will find at the end?",
      type: "multiple_choice",
      options: ["A scary monster", "A treasure", "More jungle", "A city"],
      correct_answer: "A treasure",
      difficulty: "hard",
      skill_tags: ["inference", "prediction", "comprehension"],
      visual_description: "Old treasure map with jungle path",
      hint: "Read the last sentence again — what word tells us what they'll discover?"
    }
  ]
};

// Brain Puzzles - Reasoning Level 5
export const MOCK_REASONING_ASSESSMENT: MockAssessment = {
  session_theme: "Detective Puzzle Academy",
  skill_area: "reasoning",
  level: 5,
  questions: [
    {
      id: 1,
      question_text: "Which shape comes next? 🔵 🔴 🔵 🔴 🔵 ___",
      type: "multiple_choice",
      options: ["🔵", "🔴", "🟢", "🟡"],
      correct_answer: "🔴",
      difficulty: "easy",
      skill_tags: ["patterns", "sequences"],
      visual_description: "Alternating colored circles",
      hint: "Look at how the colors take turns — blue, red, blue, red..."
    },
    {
      id: 2,
      question_text: "Dog is to puppy as cat is to ___",
      type: "multiple_choice",
      options: ["Dog", "Kitten", "Bird", "Mouse"],
      correct_answer: "Kitten",
      difficulty: "easy",
      skill_tags: ["analogies", "relationships"],
      visual_description: "Dog with puppy, cat with question mark",
      hint: "A puppy is a baby dog. What's a baby cat called?"
    },
    {
      id: 3,
      question_text: "Which one does NOT belong in the group? Apple, Banana, Carrot, Orange",
      type: "multiple_choice",
      options: ["Apple", "Banana", "Carrot", "Orange"],
      correct_answer: "Carrot",
      difficulty: "moderate",
      skill_tags: ["categorization", "odd-one-out"],
      visual_description: "Four food items in a row",
      hint: "Three of these are fruits. Which one is a vegetable?"
    },
    {
      id: 4,
      question_text: "If all roses are flowers, and some flowers are red, which is TRUE?",
      type: "multiple_choice",
      options: ["All roses are red", "Some roses might be red", "No roses are red", "Roses are not flowers"],
      correct_answer: "Some roses might be red",
      difficulty: "moderate",
      skill_tags: ["logic", "deduction"],
      visual_description: "Roses and flowers diagram",
      hint: "We know SOME flowers are red, but not ALL — so what can we say for sure?"
    },
    {
      id: 5,
      question_text: "A box has only red and blue balls. You pull out 3 red balls. What do you know for sure?",
      type: "multiple_choice",
      options: ["All balls are red", "There are at least 3 red balls", "There are no blue balls", "There are 3 balls total"],
      correct_answer: "There are at least 3 red balls",
      difficulty: "moderate",
      skill_tags: ["logic", "certainty"],
      visual_description: "Mystery box with colorful balls",
      hint: "You pulled out 3 red ones — so there must be at least that many!"
    },
    {
      id: 6,
      question_text: "Sam is taller than Mike. Mike is taller than Tom. Who is the shortest?",
      type: "multiple_choice",
      options: ["Sam", "Mike", "Tom", "They are all the same"],
      correct_answer: "Tom",
      difficulty: "hard",
      skill_tags: ["logic", "ordering", "comparison"],
      visual_description: "Three kids of different heights",
      hint: "Try putting them in order from tallest to shortest. Who ends up at the bottom?"
    }
  ]
};

// Amharic Explorer - Level 2
export const MOCK_AMHARIC_ASSESSMENT: MockAssessment = {
  session_theme: "Ethiopian Adventure",
  skill_area: "amharic",
  level: 2,
  questions: [
    {
      id: 1,
      question_text: "What does ቀይ (qey) mean?",
      type: "multiple_choice",
      options: ["Blue", "Red", "Green", "Yellow"],
      correct_answer: "Red",
      difficulty: "easy",
      skill_tags: ["vocabulary", "colors"],
      visual_description: "Red color splash",
      hint: "Think of the Ethiopian flag — ቀይ is one of its colors!"
    },
    {
      id: 2,
      question_text: "How do you say 'Hello' in Amharic?",
      type: "multiple_choice",
      options: ["አመሰግናለሁ", "ሰላም", "ደህና ሁን", "አዎ"],
      correct_answer: "ሰላም",
      difficulty: "easy",
      skill_tags: ["greetings", "vocabulary"],
      visual_description: "Two people waving hello",
      hint: "It sounds like 'selam' — a word for peace and greeting!"
    },
    {
      id: 3,
      question_text: "What does ውሃ (wiha) mean?",
      type: "multiple_choice",
      options: ["Food", "Water", "House", "Tree"],
      correct_answer: "Water",
      difficulty: "moderate",
      skill_tags: ["vocabulary", "nouns"],
      visual_description: "Glass of water",
      hint: "Say it out loud: 'wiha' — it sounds like something you drink!"
    },
    {
      id: 4,
      question_text: "Which direction is ግራ (gira)?",
      type: "multiple_choice",
      options: ["Right", "Left", "Up", "Down"],
      correct_answer: "Left",
      difficulty: "moderate",
      skill_tags: ["vocabulary", "directions"],
      visual_description: "Arrow pointing left",
      hint: "Remember: ግራ (gira) sounds a bit like 'gear' — turn left to shift gears!"
    },
    {
      id: 5,
      question_text: "Count in Amharic: አንድ, ሁለት, ___ (and, hulet, ___)",
      type: "multiple_choice",
      options: ["አራት (arat)", "ሶስት (sost)", "አምስት (amist)", "ስድስት (sidist)"],
      correct_answer: "ሶስት (sost)",
      difficulty: "moderate",
      skill_tags: ["numbers", "counting"],
      visual_description: "Numbers 1, 2, 3",
      hint: "We're counting 1, 2, ___. What number comes after 2?"
    },
    {
      id: 6,
      question_text: "If someone says 'እንዴት ነህ?' (indent neh?), they are asking...",
      type: "multiple_choice",
      options: ["What is your name?", "How are you?", "Where are you going?", "What time is it?"],
      correct_answer: "How are you?",
      difficulty: "hard",
      skill_tags: ["phrases", "conversation"],
      visual_description: "Two friends talking",
      hint: "This is what friends say when they meet — they want to know if you're well!"
    }
  ]
};

// Word Power - Vocabulary Level 6
export const MOCK_VOCABULARY_ASSESSMENT: MockAssessment = {
  session_theme: "Word Wizard Quest",
  skill_area: "vocabulary",
  level: 6,
  questions: [
    {
      id: 1,
      question_text: "What does 'gigantic' mean?",
      type: "multiple_choice",
      options: ["Very small", "Very big", "Very fast", "Very slow"],
      correct_answer: "Very big",
      difficulty: "easy",
      skill_tags: ["synonyms", "adjectives"],
      visual_description: "Giant creature next to tiny house",
      hint: "Think of the word 'giant' hiding inside 'gigantic'!"
    },
    {
      id: 2,
      question_text: "Which word is the OPPOSITE of 'ancient'?",
      type: "multiple_choice",
      options: ["Old", "Modern", "Dusty", "Broken"],
      correct_answer: "Modern",
      difficulty: "easy",
      skill_tags: ["antonyms", "adjectives"],
      visual_description: "Old castle vs modern building",
      hint: "Ancient means very, very old. What word means new or from today?"
    },
    {
      id: 3,
      question_text: "'The scientist made a discovery.' What does 'discovery' mean?",
      type: "multiple_choice",
      options: ["A mistake", "Finding something new", "A recipe", "A game"],
      correct_answer: "Finding something new",
      difficulty: "moderate",
      skill_tags: ["context-clues", "nouns"],
      visual_description: "Scientist with magnifying glass",
      hint: "Look at the word — it has 'discover' in it. What do you do when you discover?"
    },
    {
      id: 4,
      question_text: "Which word means 'to move very quickly'?",
      type: "multiple_choice",
      options: ["Crawl", "Dash", "Stroll", "Pause"],
      correct_answer: "Dash",
      difficulty: "moderate",
      skill_tags: ["synonyms", "verbs"],
      visual_description: "Person running fast",
      hint: "Think of a superhero making a quick escape — they would ___ away!"
    },
    {
      id: 5,
      question_text: "'The brave knight rescued the princess.' What does 'brave' mean?",
      type: "multiple_choice",
      options: ["Scared", "Tired", "Courageous", "Hungry"],
      correct_answer: "Courageous",
      difficulty: "moderate",
      skill_tags: ["context-clues", "adjectives"],
      visual_description: "Knight with shield and sword",
      hint: "A knight who rescues people isn't scared — they're the opposite!"
    },
    {
      id: 6,
      question_text: "What does 'peculiar' mean in: 'The cat made a peculiar sound that no one had heard before.'",
      type: "multiple_choice",
      options: ["Loud", "Strange", "Quiet", "Happy"],
      correct_answer: "Strange",
      difficulty: "hard",
      skill_tags: ["context-clues", "advanced-vocabulary"],
      visual_description: "Surprised cat making unusual face",
      hint: "No one had heard it before — so it must be unusual or different!"
    }
  ]
};

// Get mock assessment by skill area
export function getMockAssessment(skillArea: string): MockAssessment {
  switch (skillArea) {
    case 'math':
      return MOCK_MATH_ASSESSMENT;
    case 'reading':
      return MOCK_READING_ASSESSMENT;
    case 'reasoning':
      return MOCK_REASONING_ASSESSMENT;
    case 'amharic':
      return MOCK_AMHARIC_ASSESSMENT;
    case 'vocabulary':
      return MOCK_VOCABULARY_ASSESSMENT;
    default:
      return MOCK_MATH_ASSESSMENT;
  }
}

// Encouragement messages for correct answers
export const CORRECT_MESSAGES = [
  "Amazing! 🌟",
  "You're a star! ⭐",
  "Great thinking! 🧠",
  "Fantastic! 🎉",
  "Super job! 🚀",
  "You got it! 💫",
  "Brilliant! ✨",
  "Way to go! 🏆"
];

// Encouragement messages for incorrect answers
export const INCORRECT_MESSAGES = [
  "Good try! Let's keep going! 💪",
  "You're doing great! 🚀",
  "Nice effort! Keep exploring! 🌟",
  "That's okay! Onward! ⭐",
  "Keep going, explorer! 🎯"
];

export function getRandomEncouragement(isCorrect: boolean): string {
  const messages = isCorrect ? CORRECT_MESSAGES : INCORRECT_MESSAGES;
  return messages[Math.floor(Math.random() * messages.length)];
}

// Achievement badges based on score
export function getAchievementBadge(scorePercentage: number): { emoji: string; title: string } {
  if (scorePercentage === 100) {
    return { emoji: "🏆", title: "Perfect Explorer!" };
  } else if (scorePercentage >= 80) {
    return { emoji: "🌟", title: "Super Star!" };
  } else if (scorePercentage >= 60) {
    return { emoji: "💪", title: "Great Effort!" };
  } else {
    return { emoji: "🚀", title: "Keep Exploring!" };
  }
}
