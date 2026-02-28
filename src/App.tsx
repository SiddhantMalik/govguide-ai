import React, { useState, useEffect } from 'react';
import GovGuideApp from './GovGuideApp';
import './index.css';
import { 
  Globe, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Plus, 
  Search,
  ExternalLink,
  Info,
  ShieldCheck,
  Calendar
} from 'lucide-react';

const BrowserSimulator = () => {
  const [url, setUrl] = useState('https://benefits.gov/snap');
  const [isLoading, setIsLoading] = useState(false);

  const sites = [
    { id: 'snap', name: 'SNAP Benefits', url: 'https://benefits.gov/snap' },
    { id: 'health', name: 'Healthcare.gov', url: 'https://healthcare.gov/apply' },
    { id: 'ssa', name: 'Social Security', url: 'https://ssa.gov/apply' }
  ];

  const handleNavigate = (newUrl: string) => {
    setIsLoading(true);
    setUrl(newUrl);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 lg:p-10 font-sans flex flex-col items-center">
      {/* Top Info Bar */}
      <div className="w-full max-w-6xl mb-6 flex justify-between items-center text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">GovGuide AI Active</span>
          </div>
          <p className="text-xs">Prototype Mode: Simulating browser injection on .gov domains</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>Privacy-First: No data leaves this browser</span>
        </div>
      </div>

      {/* Browser Frame */}
      <div className="w-full max-w-6xl bg-[#1E293B] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden flex flex-col h-[85vh]">
        
        {/* Browser Toolbar */}
        <div className="bg-[#0F172A] p-3 flex items-center gap-4 border-b border-slate-800">
          <div className="flex gap-1.5 px-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          
          <div className="flex items-center gap-3 text-slate-500">
            <ChevronLeft size={18} className="cursor-not-allowed opacity-30" />
            <ChevronRight size={18} className="cursor-not-allowed opacity-30" />
            <RotateCw size={16} className={isLoading ? 'animate-spin text-indigo-400' : ''} />
          </div>

          <div className="flex-1 bg-[#1E293B] rounded-lg border border-slate-700 px-4 py-1.5 flex items-center gap-2">
            <Lock size={12} className="text-emerald-500" />
            <span className="text-xs text-slate-300 font-medium select-none">{url}</span>
          </div>

          <div className="flex items-center gap-4 px-2">
            <Plus size={18} className="text-slate-500 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-[#0F172A] px-4 flex gap-1 border-b border-slate-800">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => handleNavigate(site.url)}
              className={`px-6 py-2.5 text-[11px] font-bold rounded-t-lg transition-all flex items-center gap-2 ${
                url === site.url 
                  ? 'bg-[#1E293B] text-white border-t border-x border-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Globe size={12} />
              {site.name}
            </button>
          ))}
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 bg-white overflow-y-auto relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-xs font-medium animate-pulse">Loading secure government portal...</p>
            </div>
          ) : (
            <div className="p-12 max-w-4xl mx-auto">
              {url.includes('snap') && <MockSNAPPage />}
              {url.includes('healthcare') && <MockHealthPage />}
              {url.includes('ssa') && <MockSSAPage />}
            </div>
          )}
          
          {/* Extension Injected Here */}
          <GovGuideApp simulatedUrl={url} />
        </div>
      </div>
    </div>
  );
};

const MockSNAPPage = () => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <header className="border-b border-slate-100 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-slate-800 p-2 rounded text-white font-serif italic text-xl">DSS</div>
        <h1 className="text-2xl font-bold text-slate-900">SNAP Application Portal</h1>
      </div>
      <p className="text-slate-500 text-sm">Supplemental Nutrition Assistance Program • Case #29384-B</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Step 1: Household Income</h2>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Monthly Gross Income (Before Taxes)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input type="number" placeholder="0.00" className="w-full p-4 pl-10 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <p className="text-[10px] text-slate-400 italic">Include all wages, tips, and bonuses for all household members.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Income Verification</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer group">
                <input type="file" className="hidden" id="snap-income" />
                <label htmlFor="snap-income" className="cursor-pointer">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <ExternalLink size={20} className="text-indigo-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Upload Paystubs</p>
                  <p className="text-xs text-slate-400 mt-1">PDF or Image (Max 10MB)</p>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex gap-3 mb-3">
            <Info size={18} className="text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900">Important Deadline</p>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            You must submit your income verification within 10 days of starting this application to avoid delays.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MockHealthPage = () => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <header className="border-b border-slate-100 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-600 p-2 rounded text-white font-bold text-xl">H</div>
        <h1 className="text-2xl font-bold text-slate-900">Health Insurance Marketplace</h1>
      </div>
      <p className="text-slate-500 text-sm">2026 Open Enrollment • Individual & Family Plans</p>
    </header>

    <div className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Section A: Identity Verification</h2>
        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Social Security Number</label>
            <input type="password" placeholder="XXX-XX-XXXX" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
            <ShieldCheck size={24} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-900">Identity Proofing Required</p>
              <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                We need to verify your identity before you can view plan prices. This is a standard security step.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);

const MockSSAPage = () => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <header className="border-b border-slate-100 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-[#002244] p-2 rounded text-white font-bold text-xl">SSA</div>
        <h1 className="text-2xl font-bold text-slate-900">Social Security Administration</h1>
      </div>
      <p className="text-slate-500 text-sm">Apply for Retirement Benefits • Secure Portal</p>
    </header>

    <div className="max-w-3xl space-y-8">
      <div className="p-12 bg-slate-50 rounded-[40px] border border-slate-100 text-center space-y-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Calendar size={32} className="text-[#002244]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Ready to Retire?</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Most applications take about 15 minutes. Have your W-2 or self-employment tax return ready.
          </p>
        </div>
        <button className="bg-[#002244] text-white px-10 py-4 rounded-full font-bold hover:bg-[#003366] transition-all shadow-lg shadow-blue-900/20">
          Start New Application
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  return <BrowserSimulator />;
}
