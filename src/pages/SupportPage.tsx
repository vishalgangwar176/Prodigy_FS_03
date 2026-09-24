import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  MapPin,
  ChevronDown,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createTicket, getUserTickets, storageEvents } from '../services/storageService';
import { SupportTicket } from '../types';
import { useToast } from '../components/common/Toast';

const FAQS = [
  {
    q: 'What sectors in Greater Noida do you deliver to?',
    a: 'We currently deliver to Alpha 1 & 2, Beta 1 & 2, Gamma 1 & 2, Delta 1 & 2, Pari Chowk, Chi IV, ATS Greens Paradiso, Jaypee Greens, Knowledge Park II & III, Omega, and Surajpur. All orders are fulfilled from our Jagat Farm commercial hub in 20-30 minutes.',
  },
  {
    q: 'What are the delivery charges?',
    a: 'Delivery is completely FREE on all grocery orders above ₹499! For orders below ₹499, a nominal delivery fee of ₹40 applies.',
  },
  {
    q: 'How does the test payment / online payment work?',
    a: 'We support Razorpay payments in test mode for card, UPI and NetBanking, as well as Cash on Delivery. In test mode, no real money will be deducted from your account.',
  },
  {
    q: 'What if a produce item like milk or tomatoes is spoiled?',
    a: 'We offer a 100% Doorstep Quality Guarantee. If you are dissatisfied with the freshness of any item, tell the delivery rider or raise a support ticket here for an instant replacement or refund.',
  },
  {
    q: 'What are your store hours?',
    a: 'Our Jagat Farm store operates 7:00 AM to 11:00 PM every single day, including Sundays and holidays.',
  },
];

export function SupportPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Ticket Form state
  const [subject, setSubject] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTickets = () => {
      const list = getUserTickets(user?.uid || 'user-sample-01', user?.email);
      setTickets(list);
    };

    fetchTickets();
    storageEvents.addEventListener('tickets_updated', fetchTickets);
    return () => storageEvents.removeEventListener('tickets_updated', fetchTickets);
  }, [user]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      error('Please provide a subject and message.');
      return;
    }

    setIsSubmitting(true);
    const newTicket: SupportTicket = {
      id: 'TICK-' + Math.floor(100 + Math.random() * 900),
      userId: user?.uid || 'guest-user',
      userName: user?.name || 'Greater Noida Customer',
      userEmail: user?.email || 'customer@freshkart.in',
      orderId: orderId.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createTicket(newTicket);
    setSubject('');
    setOrderId('');
    setMessage('');
    setIsSubmitting(false);
    success('Support ticket created! Store manager will reply shortly.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          FreshKart Customer Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          We are here to help with your grocery orders, substitutions, delivery inquiries, and payment questions.
        </p>

        {/* Quick Contact Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-left">
            <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Call Kirana Store</span>
              <strong className="text-slate-800 dark:text-slate-200">+91 98112 34567</strong>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-left">
            <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Operating Hours</span>
              <strong className="text-slate-800 dark:text-slate-200">7:00 AM – 11:00 PM</strong>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-left">
            <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Store Hub</span>
              <strong className="text-slate-800 dark:text-slate-200">Jagat Farm, Gamma 1</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Raise a Ticket Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2E7D32]" />
              Raise a Support Ticket
            </h2>
            <p className="text-xs text-slate-500">
              Submit your request and our store manager will reply directly
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Tomato quality query or delivery delay"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Order Reference (Optional)
              </label>
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. FK-2026-8941"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Message / Details *
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe what you need assistance with..."
                rows={4}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </form>
        </div>

        {/* Right: FAQs Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Quick answers to common questions about FreshKart Greater Noida
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 gap-2"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#2E7D32]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* My Support Tickets List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          My Tickets ({tickets.length})
        </h2>

        {tickets.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tickets filed yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets.map(t => (
              <div key={t.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {t.id}
                    </span>
                    {t.orderId && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]">
                        Order: {t.orderId}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950 dark:text-emerald-300'
                        : t.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.subject}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.message}
                </p>

                {/* Admin Reply */}
                {t.adminReply && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <span className="font-bold text-[#2E7D32] dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Store Manager Reply:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{t.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
