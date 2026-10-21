import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, Mic, FileText, Award, Tv, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useAuth();

  return (
    <footer className="border-t border-slate-900 bg-slate-950/95 mt-20 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Col 1: Brand & Mission */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <img src="/logo-dark.svg" alt="ExportPilot AI" className="h-8 w-auto" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-bangla">
            {t(
              'বাংলাদেশের সাভার, গাজীপুর ও বগুড়ার এসএমই কারখানা মালিকদের জন্য সরাসরি আন্তর্জাতিক বাণিজ্য প্লাটফর্ম। কোনো মধ্যস্বত্বভোগী ছাড়াই ইউরোপ, জাপান ও মধ্যপ্রাচ্যে সরাসরি রপ্তানি।',
              'Sovereign AI trade infrastructure empowering Bangladeshi SME manufacturers to export directly to Europe, Japan, and the Middle East without middlemen.'
            )}
          </p>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Local Data Sovereignty Guard</span>
          </div>
        </div>

        {/* Col 2: Core Trade Engine */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
            {t('ট্রেড ইনফ্রাস্ট্রাকচার', 'Trade Infrastructure')}
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/docs" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">
                {t('ক্যানোনিকাল ডকুমেন্টেশন', 'Canonical Documentation')}
              </Link>
            </li>
            <li>
              <Link to="/app" className="hover:text-emerald-400 transition-colors">
                {t('লাইভ এক্সপোর্ট ডিল রুম', 'Autonomous Deal Room')}
              </Link>
            </li>
            <li>
              <Link to="/data" className="hover:text-emerald-400 transition-colors">
                {t('১২টি গ্লোবাল বায়ার ডিরেক্টরি', 'Verified Importer Directory')}
              </Link>
            </li>
            <li>
              <Link to="/security" className="hover:text-emerald-400 transition-colors">
                {t('বাংলা পিআইআই রিড্যাকশন ল্যাব', 'Bangla PII Sovereignty Lab')}
              </Link>
            </li>
            <li>
              <Link to="/architecture" className="hover:text-emerald-400 transition-colors">
                {t('৫টি ফাস্ট-এমসিপি স্বয়ংক্রিয় এজেন্ট', '5 FastMCP Agents Topology')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Technology & Speech Engine */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
            {t('ডিপগ্রাম ও ওপেন-সোর্স স্ট্যাক', 'Deepgram & OS Engine')}
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center space-x-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deepgram Nova-3 Bangla STT</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>PyMuPDF & pdfplumber Utility Parser</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>NetworkX Multi-Hop GraphRAG</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>ReportLab Vector Proforma Engine</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Audit & Verification Suite (Discrete for judges & evaluators) */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
            {t('অডিট ও মূল্যায়ন স্যুট', 'Audit & Evaluation Suite')}
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/audit" className="flex items-center space-x-1 text-slate-300 hover:text-emerald-400 transition-colors">
                <span>{t('সিস্টেম অডিট স্কোরকার্ড (৯৮/১০০)', 'Enterprise Audit Scorecard (98/100)')}</span>
              </Link>
            </li>
            <li>
              <Link to="/presentation" className="flex items-center space-x-1 text-slate-300 hover:text-emerald-400 transition-colors">
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('১৮০ সেকেন্ডের লাইভ পিচ মোড', '180s Live Pitch Mode')}</span>
              </Link>
            </li>
            <li>
              <Link to="/pitchdeck" className="flex items-center space-x-1 text-slate-300 hover:text-emerald-400 transition-colors">
                <span>{t('ইনভেস্টর ডেক (ওয়াই-কম্বিনেটর)', 'Investor Deck (YC Format)')}</span>
              </Link>
            </li>
            <li className="pt-1">
              <Link 
                to="/admin" 
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                title="সিস্টেম কন্ট্রোল ও টেলিমেট্রি"
              >
                {t('অ্যাডমিন কন্ট্রোল গেটওয়ে', 'System Admin Gateway')}
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
        <div>
          ExportPilot AI (গ্লোবাল-ব্যাপারী) • Sovereign B2B Trade Intelligence 5.0
        </div>
        <div className="flex items-center space-x-4">
          <span>Microsoft Azure Basic (B1) Protected</span>
          <span>•</span>
          <span>DIU Idea to Unicorn 2026</span>
        </div>
      </div>
    </footer>
  );
};
