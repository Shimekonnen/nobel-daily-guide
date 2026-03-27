import { useState, useEffect, useRef } from 'react';
import { X, Printer, Loader2, RefreshCw } from 'lucide-react';
import type { TimeBlock } from '../types/database';
import { generateWorksheetFromBlock, getCachedWorksheet } from '../services/worksheetService';

interface WorksheetViewerProps {
  block: TimeBlock;
  onClose: () => void;
}

export default function WorksheetViewer({ block, onClose }: WorksheetViewerProps) {
  const [worksheetHtml, setWorksheetHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadWorksheet();
  }, [block]);

  const loadWorksheet = async (forceRegenerate = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first (unless forcing regeneration)
      if (!forceRegenerate) {
        const cached = getCachedWorksheet(block);
        if (cached) {
          setWorksheetHtml(cached);
          setIsLoading(false);
          return;
        }
      }

      const html = await generateWorksheetFromBlock(block);
      setWorksheetHtml(html);
    } catch (err) {
      console.error('Failed to generate worksheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate worksheet');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    loadWorksheet(true);
  };

  const handlePrint = () => {
    if (!worksheetHtml || !printFrameRef.current) return;

    const iframe = printFrameRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    // Write the worksheet HTML to the iframe
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nobel's Worksheet</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              @page {
                size: letter;
                margin: 0.5in;
              }
            }
            body {
              font-family: 'Comic Sans MS', cursive, sans-serif;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          ${worksheetHtml}
        </body>
      </html>
    `);
    doc.close();

    // Wait for content to load, then print
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 250);
  };

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900">Worksheet</h2>
            <p className="text-sm text-gray-500">{block.activity_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isLoading || isRegenerating}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Regenerate</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={isLoading || !worksheetHtml}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              <p className="text-gray-600">Generating worksheet...</p>
              <p className="text-sm text-gray-400">This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-red-500 text-center">
                <p className="font-medium">Failed to generate worksheet</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => loadWorksheet(true)}
                className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {worksheetHtml && !isLoading && (
            <div className="bg-white rounded-lg shadow-sm p-4 min-h-[600px]">
              {/* Worksheet preview */}
              <div
                className="worksheet-preview"
                dangerouslySetInnerHTML={{ __html: worksheetHtml }}
              />
            </div>
          )}
        </div>

        {/* Hidden iframe for printing */}
        <iframe
          ref={printFrameRef}
          className="hidden"
          title="Print Frame"
        />
      </div>

      {/* Print-specific styles */}
      <style>{`
        .worksheet-preview {
          font-family: 'Comic Sans MS', cursive, sans-serif;
        }
        .worksheet-preview h1 {
          font-size: 24pt;
          margin-bottom: 10px;
        }
        .worksheet-preview h2 {
          font-size: 18pt;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .worksheet-preview p {
          font-size: 14pt;
          line-height: 1.6;
        }
        .worksheet-preview table {
          width: 100%;
          border-collapse: collapse;
        }
        .worksheet-preview td, .worksheet-preview th {
          padding: 8px;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
}
