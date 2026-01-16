'use client';
import { useTheme } from '@/context/ThemeContext';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardMetrics({ reviews }: { reviews: any[] }) {
  const { theme } = useTheme();
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // --- CHANGED: Filter out empty reviews for Sentiment Analysis ---
  // Only consider reviews that actually have text content
  const sentimentReviews = safeReviews.filter((r: any) => 
    r.text && 
    r.text.trim().length > 0 && 
    r.text !== 'No written review'
  );

  const totalSentimentReviews = sentimentReviews.length;

  // 1. Calculate Counts (using the filtered list)
  const pos = sentimentReviews.filter((r: any) => r.sentiment === 'Positive').length;
  const neg = sentimentReviews.filter((r: any) => r.sentiment === 'Negative').length;
  const neu = sentimentReviews.filter((r: any) => r.sentiment === 'Neutral').length;

  // 2. Calculate Percentages
  const getPercent = (count: number) => totalSentimentReviews > 0 ? Math.round((count / totalSentimentReviews) * 100) : 0;
  
  const sentimentStats = [
    { label: 'Positive', count: pos, pct: getPercent(pos), color: '#22c55e' }, // Green
    { label: 'Negative', count: neg, pct: getPercent(neg), color: '#ef4444' }, // Red
    { label: 'Neutral',  count: neu, pct: getPercent(neu), color: '#cbd5e1' }, // Grey
  ];

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [pos, neg, neu],
      backgroundColor: sentimentStats.map(s => s.color),
      hoverOffset: 4,
      borderWidth: 0,
    }]
  };

  // Theme Logic (Still uses ALL reviews because themes might technically be extracted from short text that we kept, or just to be safe)
  // Actually, themes are only extracted if there is text, so using safeReviews is fine, 
  // but using sentimentReviews ensures consistency between the two charts.
  const themeCounts = { Comfort: 0, Durability: 0, Appearance: 0 };
  
  // Using the same filtered list for consistency
  sentimentReviews.forEach((r: any) => {
    if (r.themes && Array.isArray(r.themes)) {
      r.themes.forEach((t: string) => {
        if (t === 'Comfort') themeCounts.Comfort++;
        if (t === 'Durability') themeCounts.Durability++;
        if (t === 'Appearance') themeCounts.Appearance++;
      });
    }
  });

  const themeData = {
    labels: ['Comfort', 'Durability', 'Appearance'],
    datasets: [{
      label: 'Count',
      data: [themeCounts.Comfort, themeCounts.Durability, themeCounts.Appearance],
      backgroundColor: ['#fbcfe8', '#fecdd3', '#bae6fd'], 
      borderColor: ['#ec4899', '#e11d48', '#0ea5e9'],
      borderWidth: 1
    }]
  };

  // --- STYLES ---
  const cardClass = theme === 'dark' 
    ? 'bg-slate-900 border-slate-800 text-white' 
    : 'bg-white border-gray-200 text-gray-900'; 

  const headingClass = theme === 'dark' ? 'text-slate-300' : 'text-gray-800'; 
  const legendTextClass = theme === 'dark' ? 'text-slate-200' : 'text-gray-900';
  const legendNumberClass = theme === 'dark' ? 'text-white' : 'text-black';
  
  const chartTextColor = theme === 'dark' ? '#cbd5e1' : '#334155';

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { 
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1, color: chartTextColor },
        grid: { color: theme === 'dark' ? '#334155' : '#cbd5e1' },
        title: {
          display: true,
          text: 'Count',
          color: chartTextColor,
          font: { size: 14, weight: 'bold' as const } 
        }
      },
      x: {
        ticks: { color: chartTextColor },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* SENTIMENT CHART */}
      <div className={`p-6 rounded-xl border shadow-sm flex flex-col transition-colors duration-300 ${cardClass}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${headingClass}`}>Sentiment Analysis</h3>
          {/* Optional: Show how many text reviews are being analyzed */}
          <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            Based on {totalSentimentReviews} text reviews
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-6 h-full">
          <div className="w-32 h-32 relative shrink-0">
            {totalSentimentReviews > 0 ? (
              <Pie 
                data={sentimentData} 
                options={{ 
                  plugins: { legend: { display: false } }, 
                  maintainAspectRatio: true 
                }} 
              />
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] ${headingClass}`}>No Data</div>
            )}
          </div>

          <div className="flex flex-col gap-3 min-w-[120px]">
            {sentimentStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></span>
                  <span className={`font-medium ${legendTextClass}`}>{stat.label}</span>
                </div>
                <span className={`font-bold ${legendNumberClass}`}>{stat.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THEME BAR CHART */}
      <div className={`p-6 rounded-xl border shadow-sm flex flex-col items-center transition-colors duration-300 ${cardClass}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 w-full text-left ${headingClass}`}>
          Theme Detection
        </h3>
        <div className="w-full h-full flex items-end justify-center pb-2">
          {totalSentimentReviews > 0 ? (
            <Bar data={themeData} options={barOptions} />
          ) : (
            <div className={`h-full flex items-center justify-center text-sm ${headingClass}`}>
              No Data
            </div>
          )}
        </div>
      </div>

    </div>
  );
}