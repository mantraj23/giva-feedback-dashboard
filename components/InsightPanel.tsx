'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Loader2, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export default function InsightPanel({ productId }: { productId: string }) {
  const { theme } = useTheme();
  const [insights, setInsights] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // --- BUG FIX: Reset state when productId changes ---
  useEffect(() => {
    setInsights([]);
    setStats(null);
    setHasLoaded(false);
    setLoading(false);
  }, [productId]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insights?productId=${productId}`);
      const data = await res.json();
      setInsights(data.insights || []);
      setStats(data.stats || null);
      setHasLoaded(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const cardClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-slate-300' : 'text-gray-700';
  const statsBoxClass = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100';
  const insightItemClass = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-100 text-gray-900';

  const buttonClass = theme === 'dark' 
    ? 'bg-white text-black hover:bg-gray-200' 
    : 'bg-black text-white hover:bg-gray-800';

  const ThemeBar = ({ label, data }: any) => {
    if (!data || data.total === 0) return null;
    const posPct = (data.pos / data.total) * 100;
    const negPct = (data.neg / data.total) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-800'}`}>{label}</span>
          <span className={textSub}>{data.total} mentions</span>
        </div>
        <div className={`h-2 w-full rounded-full flex overflow-hidden border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'}`}>
          <div style={{ width: `${posPct}%` }} className="bg-emerald-500 h-full" />
          <div style={{ width: `${negPct}%` }} className="bg-rose-500 h-full" />
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm transition-colors duration-300 h-full ${cardClass}`}>
      
      {/* HEADER */}
      <div className="mb-6">
        <h3 className={`text-xl font-bold text-left ${textMain}`}>
          Insights
        </h3>
      </div>

      {!hasLoaded ? (
        <div className="text-center py-4">
          <p className={`text-sm mb-5 leading-relaxed ${textSub}`}>
            Analyze customer feedback patterns to detect quality issues and design flaws.
          </p>
          <button 
            onClick={generateInsights}
            disabled={loading}
            className={`w-full font-medium py-3 rounded-lg flex justify-center items-center gap-2 text-sm transition ${buttonClass}`}
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Generate Insights"}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          
          {stats && (stats.Comfort?.total > 0 || stats.Durability?.total > 0 || stats.Appearance?.total > 0) && (
            <div className={`p-4 rounded-lg border mb-5 ${statsBoxClass}`}>
              <h4 className={`text-xs font-bold uppercase mb-4 tracking-wider ${textSub}`}>Sentiment Breakdown</h4>
              <ThemeBar label="Durability" data={stats.Durability} />
              <ThemeBar label="Comfort" data={stats.Comfort} />
              <ThemeBar label="Appearance" data={stats.Appearance} />
            </div>
          )}

          <div className="space-y-3 mb-5">
            {insights.map((insight, i) => (
              <div key={i} className={`flex gap-3 items-start p-3 rounded-lg border shadow-sm text-sm ${insightItemClass}`}>
                {insight.includes('CRITICAL') ? <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
          
          <button 
            onClick={generateInsights}
            className={`w-full font-medium py-3 rounded-lg flex justify-center items-center gap-2 text-sm transition ${buttonClass}`}
          >
             {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><RefreshCw className="w-4 h-4" /> Refresh Analysis</>}
          </button>
        </div>
      )}
    </div>
  );
}