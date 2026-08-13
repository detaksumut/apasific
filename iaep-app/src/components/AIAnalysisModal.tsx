import React from 'react';
import ReactDOM from 'react-dom';
import { Bot, Save, X, AlertCircle } from 'lucide-react';

interface AIAnalysisModalProps {
  isOpen: boolean;
  analysis: any;
  onClose: () => void;
  onSave: () => void;
  onReject: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, analysis, onClose, onSave, onReject }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-[90vw] max-w-[1000px] h-[85vh] flex flex-col shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-wide">AI ANALYSIS REPORT</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="prose prose-invert max-w-none text-zinc-300">
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 leading-relaxed whitespace-pre-wrap">
              {analysis?.rawContent || 'No analysis content available.'}
            </div>
          </div>
          
          {/* Metadata Section */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
            {[
              { label: 'Provider', value: analysis?.provider },
              { label: 'Model', value: analysis?.model },
              { label: 'Length', value: `${analysis?.inputLength || 0} chars` },
              { label: 'Status', value: analysis?.status },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{item.label}</div>
                <div className="text-sm text-zinc-200 font-mono mt-0.5">{item.value || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
             <AlertCircle className="w-4 h-4" />
             <span>Review output before finalizing record.</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onReject} className="px-5 py-2 flex items-center gap-2 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-all">
              <X className="w-4 h-4" /> REJECT
            </button>
            <button onClick={onSave} className="px-5 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 transition-all">
              <Save className="w-4 h-4" /> SAVE RECORD
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
