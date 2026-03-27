import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  Send,
  Loader2,
  Mic,
  MicOff,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  Lightbulb,
  Quote,
  ListChecks,
  XCircle,
  Sparkles,
} from 'lucide-react';
import {
  getParentingGuidance,
  saveCoachingHistory,
  getCoachingHistory,
  QUICK_SCENARIOS,
} from '../services/coachService';
import type { CoachingResponse, CoachingHistory } from '../types/database';

// Speech recognition types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Child ID for demo - in real app, would come from context/auth
const DEMO_CHILD_ID = '00000000-0000-0000-0000-000000000001';

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CoachPage() {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CoachingResponse | null>(null);
  const [history, setHistory] = useState<CoachingHistory[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect iOS Safari
  const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognitionAPI);
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getCoachingHistory(DEMO_CHILD_ID, 20);
    setHistory(data);
  };

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechError('Speech recognition not supported');
      return;
    }

    // Clear any previous errors
    setSpeechError(null);

    const recognition = new SpeechRecognitionAPI();
    // Safari doesn't support continuous well, so disable it for iOS
    recognition.continuous = !isIOSSafari;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setScenario((prev) => prev + (prev ? ' ' : '') + finalTranscript.trim());
        setInterimTranscript('');

        // Reset silence timer (longer for Safari since it restarts)
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // On iOS Safari, recognition ends after each phrase, so auto-restart
        if (isIOSSafari) {
          silenceTimerRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                // Recognition may have already started
              }
            }
          }, 100);
        } else {
          silenceTimerRef.current = setTimeout(() => {
            stopListening();
          }, 2000);
        }
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error:', event.error);

      // Handle specific errors
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        // Not really an error, just no speech detected
        setSpeechError(null);
      } else if (event.error === 'network') {
        setSpeechError('Network error. Please check your connection.');
      } else {
        setSpeechError(`Speech error: ${event.error}`);
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      // On iOS Safari, don't auto-stop - let user tap to stop
      if (!isIOSSafari || !recognitionRef.current) {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setSpeechError('Failed to start voice input. Please try again.');
      setIsListening(false);
    }
  }, [isIOSSafari]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = () => {
    // Clear any previous errors when user tries again
    setSpeechError(null);

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = async (scenarioText?: string) => {
    const textToSubmit = scenarioText || scenario;
    if (!textToSubmit.trim() || loading) return;

    stopListening();
    setLoading(true);
    setResponse(null);

    try {
      const result = await getParentingGuidance(textToSubmit);
      setResponse(result);

      // Save to history
      await saveCoachingHistory(DEMO_CHILD_ID, textToSubmit, result);
      await loadHistory();
    } catch (error) {
      console.error('Error getting guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickScenario = (quickScenario: string) => {
    setScenario(quickScenario);
    handleSubmit(quickScenario);
  };

  const handleCopyResponse = async () => {
    if (!response) return;

    const text = `Strategy: ${response.strategy_name}

${response.strategy_description}

What's Happening:
${response.whats_happening}

What To Say:
${response.what_to_say.map((s) => `- ${s}`).join('\n')}

What To Do:
${response.what_to_do.map((s) => `- ${s}`).join('\n')}

What To Avoid:
${response.what_to_avoid.map((s) => `- ${s}`).join('\n')}

Why It Works:
${response.why_it_works}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistoryClick = (item: CoachingHistory) => {
    if (expandedHistoryId === item.id) {
      setExpandedHistoryId(null);
    } else {
      setExpandedHistoryId(item.id);
      setResponse(item.response);
    }
  };

  return (
    <div className="flex-1 pb-6 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-coach to-coach-dark p-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Parenting Coach</h1>
        </div>
        <p className="text-white/80 text-sm">
          Get guidance for everyday moments with Nobel
        </p>
      </div>

      {/* Input Area */}
      <div className="px-4 -mt-4">
        <div className="bg-surface rounded-2xl border border-border shadow-lg p-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={scenario + interimTranscript}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="What's happening? (e.g., 'Nobel is refusing to eat his dinner')"
              className="w-full p-4 pr-24 bg-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-coach/50 focus:border-coach text-text placeholder:text-text-muted min-h-[100px]"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  disabled={loading}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse-mic'
                      : 'bg-coach/10 text-coach hover:bg-coach/20'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={() => handleSubmit()}
                disabled={!scenario.trim() || loading}
                className="p-3 bg-coach text-white rounded-xl hover:bg-coach-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-sm text-coach">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {isIOSSafari
                ? 'Listening... Tap mic again to stop'
                : 'Listening... Speak now'}
            </div>
          )}

          {speechError && (
            <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">{speechError}</p>
              <button
                onClick={() => setSpeechError(null)}
                className="text-amber-600 hover:text-amber-800 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Scenarios */}
          <div className="mt-4">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide font-medium">
              Quick scenarios
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SCENARIOS.map(({ label, scenario: quickScenario }) => (
                <button
                  key={label}
                  onClick={() => handleQuickScenario(quickScenario)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-coach/5 text-coach text-sm rounded-full hover:bg-coach/10 transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-4 mt-6">
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <Loader2 className="w-10 h-10 text-coach animate-spin mx-auto mb-4" />
            <p className="text-text font-medium">Finding the best approach...</p>
            <p className="text-text-muted text-sm mt-1">
              Analyzing the situation with whole-brain strategies
            </p>
          </div>
        </div>
      )}

      {/* Response Cards */}
      {response && !loading && (
        <div className="px-4 mt-6 space-y-4">
          {/* Strategy Card */}
          <div className="bg-gradient-to-br from-coach/10 to-coach/5 rounded-2xl border border-coach/20 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-coach" />
                <span className="text-xs uppercase tracking-wide text-coach font-medium">
                  Strategy
                </span>
              </div>
              <button
                onClick={handleCopyResponse}
                className="p-2 text-text-muted hover:text-coach transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">{response.strategy_name}</h2>
            <p className="text-text-muted">{response.strategy_description}</p>
          </div>

          {/* What's Happening Card */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="text-xs uppercase tracking-wide text-text-muted font-medium">
                What's Happening
              </span>
            </div>
            <p className="text-text leading-relaxed">{response.whats_happening}</p>
          </div>

          {/* What To Say Card - Prominent */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Quote className="w-5 h-5 text-blue-600" />
              <span className="text-xs uppercase tracking-wide text-blue-600 font-medium">
                What To Say
              </span>
            </div>
            <div className="space-y-4">
              {response.what_to_say.map((phrase, index) => (
                <div
                  key={index}
                  className="bg-white/80 rounded-xl p-4 border-l-4 border-blue-400"
                >
                  <p className="text-text text-lg leading-relaxed">{phrase}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What To Do Card */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-green-600" />
              <span className="text-xs uppercase tracking-wide text-text-muted font-medium">
                What To Do
              </span>
            </div>
            <div className="space-y-3">
              {response.what_to_do.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-text pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What To Avoid Card */}
          <div className="bg-red-50/50 rounded-2xl border border-red-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-xs uppercase tracking-wide text-red-500 font-medium">
                What To Avoid
              </span>
            </div>
            <div className="space-y-3">
              {response.what_to_avoid.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-400 rounded-full mt-2" />
                  <p className="text-text">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why It Works Card */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              <span className="text-xs uppercase tracking-wide text-text-muted font-medium">
                Why It Works
              </span>
            </div>
            <p className="text-text leading-relaxed">{response.why_it_works}</p>
          </div>

          {/* Attribution Footer */}
          <div className="bg-coach/5 rounded-xl p-4 text-center">
            <p className="text-xs text-text-muted leading-relaxed">
              Inspired by whole-brain child development principles. Every child is different —
              adapt these suggestions to what works for Nobel and your family.
            </p>
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="px-4 mt-8">
          <h3 className="text-sm uppercase tracking-wide text-text-muted font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Guidance
          </h3>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => handleHistoryClick(item)}
                  className="w-full p-4 text-left hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-text font-medium truncate">{item.scenario}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-coach font-medium">
                          {item.strategy_name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatTimestamp(item.created_at)}
                        </span>
                      </div>
                    </div>
                    {expandedHistoryId === item.id ? (
                      <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                    )}
                  </div>
                </button>

                {expandedHistoryId === item.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-border bg-background/30">
                    <div className="pt-4 space-y-3">
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                          What to say
                        </p>
                        <p className="text-sm text-text">{item.response.what_to_say[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                          First step
                        </p>
                        <p className="text-sm text-text">{item.response.what_to_do[0]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Attribution */}
      <div className="px-4 mt-8 pb-4">
        <p className="text-xs text-text-muted text-center leading-relaxed">
          Guidance inspired by whole-brain child development research by Daniel J. Siegel, M.D.
          and Tina Payne Bryson, Ph.D. This tool provides general parenting strategies — not
          professional advice.
        </p>
      </div>
    </div>
  );
}
