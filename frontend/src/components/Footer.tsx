import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, Mic, FileText, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useAuth();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 mt-24 text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Ft1 Mast-head: Wordmark, Mission & Direct Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <img src="/logo-dark.svg" alt="ExportPilot AI" className="h-7 w-auto" />
              <span className="pill-status pill-accent">SOVEREIGN GATEWAY</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-bangla">
              {t(
                'বাংলাদেশের সাভার, গাজীপুর ও বগুড়ার এসএমই কারখানা মালিকদের জন্য সরাসরি আন্তর্জাতিক বাণিজ্য প্লাটফর্ম। বায়িং হাউসের কোনো প্রকার মধ্যস্বত্বভোগী ছাড়াই ইউরোপ, জাপান ও মধ্যপ্রাচ্যে সরাসরি ডলারে রপ্তানি।',
                'Sovereign AI trade infrastructure empowering Bangladeshi SME manufacturers to export directly to Europe, Japan, and the Middle East without middlemen.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="pill-status">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Local Data Sovereignty</span>
            </div>
            <div className="pill-status">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deepgram Nova-3 Bangla STT</span>
            </div>
            <div className="pill-status">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>5 FastMCP Agent Nodes</span>
            </div>
          </div>
        </div>

        {/* Functional Navigation Rail */}
        <nav className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold" aria-label="Footer Navigation">
          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <Link to="/app" className="hover:text-emerald-400 transition-colors">
              {t('ডিল রুম', 'Deal Room')}
            </Link>
            <Link to="/buyers" className="hover:text-emerald-400 transition-colors">
              {t('বায়ার ক্যাটালগ', 'Buyer Catalog')}
            </Link>
            <Link to="/docs" className="hover:text-emerald-400 transition-colors text-emerald-400">
              {t('ক্যানোনিকাল ডক্স', 'Canonical Docs')}
            </Link>
            <Link to="/data" className="hover:text-emerald-400 transition-colors">
              {t('ডেটা ল্যাব', 'Data Lab')}
            </Link>
            <Link to="/security" className="hover:text-emerald-400 transition-colors">
              {t('সার্বভৌমত্ব ল্যাব', 'Sovereignty Lab')}
            </Link>
            <Link to="/architecture" className="hover:text-emerald-400 transition-colors">
              {t('এজেন্ট পাইপলাইন', 'Agent Pipeline')}
            </Link>
            <Link to="/audit" className="hover:text-emerald-400 transition-colors">
              {t('সিস্টেম স্কোরকার্ড', 'System Scorecard')}
            </Link>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            DIU Idea to Unicorn 2026
          </div>
        </nav>

        {/* Ft4 Dense Typographic Colophon */}
        <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-400 font-mono space-y-2 leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>WCO Harmonized System 2026 Revision / EU CBAM Regulation 2023/956 / ISO 14064-1 Carbon Accounting</span>
            <span>Live on Azure Linux App Service (asp-exportpilot-bd)</span>
          </div>
          <div>
            Client-Side Sovereignty Redactor: 8 Regex Filters (NID-10/13/17, TIN, BIN, Phone, IBAN, Bank Swift). No raw sensitive Bangladeshi manufacturing data is exported overseas without local tokenization.
          </div>
          <div className="text-slate-400">
            ExportPilot AI © 2026 EquiSaaS-BD. Autonomous Sovereign Trade Intelligence Infrastructure.
          </div>
        </div>

      </div>
    </footer>
  );
};
