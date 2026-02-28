import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  ChevronRight,
  Info, 
  Calendar,
  Sparkles,
  UserCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { explainText, getMockInterviewResponse } from './services/gemini';
import { getChecklistForUrl, ChecklistItem, getNextSteps, getSupportResources, getProactiveTip, getWelcomeMessage } from './services/checklist';

// --- Components ---

const FloatingBubble = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => (
  <motion.button
    id="civicease-bubble"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-[9999] transition-colors ${
      isOpen ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
    }`}
  >
    {isOpen ? <X size={28} /> : <Sparkles size={28} />}
    {!isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -top-12 right-0 bg-white text-slate-800 px-3 py-1 rounded-lg text-xs font-bold shadow-md whitespace-nowrap border border-slate-100"
      >
        Need help with this form?
      </motion.div>
    )}
  </motion.button>
);

const SelectionTooltip = ({ position, text, onExplain }: { position: { x: number; y: number }; text: string; onExplain: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{ top: position.y - 50, left: position.x }}
    className="fixed z-[10000] bg-white shadow-xl rounded-full border border-indigo-100 flex items-center overflow-hidden"
  >
    <button 
      onClick={onExplain}
      className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2"
    >
      <Sparkles size={14} /> Explain "{text.length > 15 ? text.substring(0, 15) + '...' : text}"
    </button>
  </motion.div>
);

export default function GovGuideApp({ simulatedUrl }: { simulatedUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'interview' | 'explain' | 'dashboard'>('checklist');
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeType, setNudgeType] = useState<'welcome' | 'tip'>('welcome');
  
  // Checklist & Submission State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', optedIn: false });
  
  // Interview State
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hi! I'm your GovGuide AI assistant. Would you like to practice for your eligibility interview? I can help you prepare for the questions they might ask." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentUrl = simulatedUrl || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    setChecklist(getChecklistForUrl(currentUrl));
    
    // Show welcome nudge after 1.5 seconds
    const welcomeTimer = setTimeout(() => {
      setNudgeType('welcome');
      setShowNudge(true);
    }, 1500);

    // Show site-specific tip after 8 seconds
    const tip = getProactiveTip(currentUrl);
    let tipTimer: any;
    if (tip) {
      tipTimer = setTimeout(() => {
        setNudgeType('tip');
        setShowNudge(true);
      }, 8000);
    }

    // Privacy-Preserving Auto-Detection Logic
    const autoDetectInterval = setInterval(() => {
      setChecklist(prev => {
        let changed = false;
        const next = prev.map(item => {
          if (item.completed || !item.pattern) return item;
          
          // Look for inputs or labels matching the pattern
          const keywords = item.pattern.split(',');
          const isFilled = keywords.some(kw => {
            // 1. Check for file inputs that have files
            const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
            const hasFile = fileInputs.some(input => {
              const label = input.closest('label')?.innerText.toLowerCase() || "";
              const aria = input.getAttribute('aria-label')?.toLowerCase() || "";
              return (label.includes(kw) || aria.includes(kw)) && (input as HTMLInputElement).files?.length;
            });

            // 2. Check for text inputs that are filled
            const textInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]'));
            const hasText = textInputs.some(input => {
              const label = document.querySelector(`label[for="${input.id}"]`)?.innerHTML.toLowerCase() || "";
              const placeholder = input.getAttribute('placeholder')?.toLowerCase() || "";
              return (label.includes(kw) || placeholder.includes(kw)) && (input as HTMLInputElement).value.length > 0;
            });

            return hasFile || hasText;
          });

          if (isFilled) {
            changed = true;
            return { ...item, completed: true };
          }
          return item;
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      clearTimeout(welcomeTimer);
      if (tipTimer) clearTimeout(tipTimer);
      clearInterval(autoDetectInterval);
    };
  }, [currentUrl]);

  // Selection logic moved inside useEffect to avoid missing it
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText && selectedText.length > 2 && selectedText.length < 100) {
        setSelection({ text: selectedText, x: e.clientX, y: e.clientY });
      } else {
        setSelection(null);
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleExplain = async () => {
    if (!selection) return;
    setIsOpen(true);
    setActiveTab('explain');
    setExplanation(null);
    setIsExplaining(true);
    const result = await explainText(selection.text, document.title);
    setExplanation(result || "Could not explain this term.");
    setIsExplaining(false);
    setSelection(null);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newChat = [...chat, { role: 'user' as const, text: userInput }];
    setChat(newChat);
    setUserInput('');
    setIsTyping(true);
    const aiResponse = await getMockInterviewResponse([], userInput);
    setChat([...newChat, { role: 'ai' as const, text: aiResponse || "I'm sorry, I'm having trouble responding." }]);
    setIsTyping(false);
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleFinalSubmit = () => {
    setIsSubmitted(true);
    setActiveTab('dashboard');
  };

  const handleOptIn = (e: React.FormEvent) => {
    e.preventDefault();
    setContactInfo(prev => ({ ...prev, optedIn: true }));
  };

  const allCompleted = checklist.length > 0 && checklist.every(i => i.completed);

  return (
    <div className="govguide-root font-sans">
      {/* Selection Tooltip */}
      <AnimatePresence>
        {selection && (
          <SelectionTooltip 
            position={{ x: selection.x, y: selection.y }} 
            text={selection.text} 
            onExplain={handleExplain} 
          />
        )}
      </AnimatePresence>

      {/* Main Bubble */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4">
        <AnimatePresence>
          {showNudge && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="bg-white p-5 rounded-2xl shadow-2xl border border-indigo-100 max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
              <button 
                onClick={() => setShowNudge(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
              
              {nudgeType === 'welcome' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Sparkles size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">{getWelcomeMessage().title}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    GovGuide AI is your helping hand.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {getWelcomeMessage().message}
                  </p>
                  <ul className="space-y-1.5 pt-1">
                    {getWelcomeMessage().features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => { setIsOpen(true); setShowNudge(false); }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-100 mt-2"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg h-fit">
                    <Info size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Pro-Active Alert</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      {getProactiveTip(currentUrl) || getProactiveTip("snap")}
                    </p>
                    <button 
                      onClick={() => { setIsOpen(true); setActiveTab('interview'); setShowNudge(false); }}
                      className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Prepare for Interview →
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <FloatingBubble onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[9998] flex flex-col border-l border-slate-100"
          >
            {/* Header */}
            <div className="p-6 border-bottom border-slate-100 bg-indigo-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} />
                  <h1 className="text-lg font-bold tracking-tight">GovGuide AI</h1>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                {isSubmitted ? "Your Application Dashboard" : `Helping you navigate ${window.location.hostname}`}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { id: 'checklist', icon: CheckCircle2, label: 'Checklist', hidden: isSubmitted },
                { id: 'dashboard', icon: Info, label: 'Dashboard', hidden: !isSubmitted },
                { id: 'interview', icon: MessageSquare, label: 'Interview', hidden: false },
                { id: 'explain', icon: HelpCircle, label: 'Explain', hidden: false }
              ].filter(t => !t.hidden).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {activeTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                      <Sparkles className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">GovGuide AI Auto-Detect</p>
                      <p className="text-[10px] text-emerald-600">I'm automatically checking off items as you fill the form. No personal data is ever recorded.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-slate-800">Required Documents</h2>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      {checklist.filter(c => c.completed).length}/{checklist.length}
                    </span>
                  </div>
                  {checklist.map(item => (
                    <motion.div 
                      key={item.id}
                      layout
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        item.completed ? 'bg-indigo-50 border-indigo-200 opacity-75' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                      onClick={() => toggleChecklist(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        }`}>
                          {item.completed && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${item.completed ? 'text-indigo-900 line-through' : 'text-slate-800'}`}>
                            {item.task}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {allCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 p-6 bg-indigo-600 rounded-2xl text-center shadow-xl shadow-indigo-200"
                    >
                      <Sparkles className="mx-auto text-indigo-200 mb-3" size={32} />
                      <h3 className="text-white font-bold mb-2">Ready to Submit?</h3>
                      <p className="text-indigo-100 text-xs mb-4">You've gathered all required documents. Submit your form on the website, then click below to track your progress.</p>
                      <button 
                        onClick={handleFinalSubmit}
                        className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        I've Submitted My Form
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Status Tracker */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Application Status</h3>
                    <div className="space-y-6 relative">
                      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100" />
                      {getNextSteps().map((step, i) => (
                        <div key={i} className="flex items-start gap-4 relative z-10">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-indigo-600' : 
                            step.status === 'pending' ? 'bg-indigo-100 border-2 border-indigo-600' : 'bg-white border-2 border-slate-200'
                          }`}>
                            {step.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-bold ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-800'}`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-slate-500">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opt-in Form */}
                  {!contactInfo.optedIn ? (
                    <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                      <h3 className="text-sm font-bold text-indigo-900 mb-2">Get Reminders</h3>
                      <p className="text-xs text-indigo-700 mb-4 leading-relaxed">We'll notify you when your status changes or if you have an upcoming interview.</p>
                      <form onSubmit={handleOptIn} className="space-y-3">
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          className="w-full p-3 rounded-xl border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={contactInfo.email}
                          onChange={e => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <input 
                          type="tel" 
                          placeholder="Phone Number (Optional)"
                          className="w-full p-3 rounded-xl border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={contactInfo.phone}
                          onChange={e => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        />
                        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100">
                          Enable Notifications
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex gap-3">
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Notifications Active</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">We'll send updates to {contactInfo.email || contactInfo.phone}.</p>
                      </div>
                    </div>
                  )}

                  {/* Support Resources */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community Support</h3>
                    {getSupportResources().map((resource, i) => (
                      <a 
                        key={i} 
                        href={resource.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                            {resource.category}
                          </span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{resource.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{resource.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'interview' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 space-y-4 mb-4">
                    {chat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your answer..."
                      className="w-full p-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'explain' && (
                <div className="space-y-6">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Term</h3>
                    <p className="text-sm font-bold text-slate-800 italic">
                      "{selection?.text || "Highlight text on the page to explain it"}"
                    </p>
                  </div>

                  {isExplaining ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-xs font-medium text-slate-500">Gemini is simplifying this for you...</p>
                    </div>
                  ) : explanation ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-indigo-600 text-white rounded-2xl shadow-lg relative overflow-hidden"
                    >
                      <Sparkles className="absolute -right-2 -top-2 opacity-20" size={60} />
                      <h3 className="text-xs font-bold text-indigo-100 mb-2 flex items-center gap-2">
                        <Info size={14} /> Plain Language Explanation
                      </h3>
                      <p className="text-sm leading-relaxed font-medium">
                        {explanation}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                        Highlight any confusing word or phrase on the form to get a simple explanation.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Privacy Active</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <UserCircle size={12} />
                <span>asyatsow@gmail.com</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
