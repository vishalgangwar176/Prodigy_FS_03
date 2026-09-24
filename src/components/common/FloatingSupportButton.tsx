import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleQuestion, X, Phone, FileText, ChevronRight } from 'lucide-react';

export function FloatingSupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-40">
      {isOpen && (
        <div className="mb-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Kirana Store Support
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Need urgent help with an ongoing delivery in Greater Noida?
          </p>
          <div className="space-y-1.5 text-xs">
            <a
              href="tel:+919811234567"
              className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#2E7D32] dark:text-emerald-400 font-semibold hover:bg-emerald-100 transition"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>Call Jagat Farm Store</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/support"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Raise a Ticket / FAQs</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-emerald-900/20 font-bold text-xs transition active:scale-95 group"
        aria-label="Need Help?"
      >
        <MessageCircleQuestion className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition" />
        <span className="hidden sm:inline">Need Help?</span>
      </button>
    </div>
  );
}
