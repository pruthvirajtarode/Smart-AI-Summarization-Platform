import React, { useState, useEffect, useCallback } from 'react';
import { 
    Download, 
    ChevronLeft, 
    FileText, 
    MessageSquare, 
    Mic, 
    PieChart as PieChartIcon, 
    Hash, 
    TrendingUp, 
    Lightbulb,
    Loader2,
    Calendar,
    Clock,
    User,
    PlayCircle,
    Award,
    Zap
} from 'lucide-react';
import axios from 'axios';
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    Radar 
} from 'recharts';
import { motion } from 'framer-motion';


const AnalysisResult = ({ processId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rubrics'); // summary, transcript, insights, rubrics

    const fetchStatus = useCallback(async () => {
        try {
            const res = await axios.get(`/api/v1/status/${processId}`);
            if (res.data.status === 'completed') {
                setData(res.data);
                setLoading(false);
            } else if (res.data.status === 'failed') {
                setData(res.data);
                setLoading(false);
            } else {
                // Keep polling
                setTimeout(fetchStatus, 3000);
            }
        } catch (err) {
            console.error('Failed to fetch status', err);
            setLoading(false);
        }
    }, [processId]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-white">
                <Loader2 className="animate-spin text-indigo-500" size={64} />
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Analyzing Your Content...</h2>
                    <p className="text-slate-400">Our AI agents are working their magic. This may take a minute.</p>
                </div>
            </div>
        );
    }

    if (!data || data.status === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center p-4">
                    <FileText className="text-red-500" size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Oops! Processing Failed</h2>
                    <p className="text-slate-400 max-w-md mt-2">{data?.error || "We couldn't process your request. Please try again with a different file."}</p>
                </div>
                <button onClick={onBack} className="secondary-button">
                    <ChevronLeft size={20} /> Try Again
                </button>
            </div>
        );
    }

    const { analysis, transcript, content, type, created_at, filename, video_url } = data;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="secondary-button p-3 rounded-full hover:bg-white/10 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {filename || (video_url ? "YouTube Video" : "Document Analysis")}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(created_at).toLocaleTimeString()}</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                {type}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.open(`/api/v1/download/${processId}`, '_blank')}
                        className="glass-button bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30"
                    >
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-800">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="flex border-b border-white/10 bg-white/[0.05]">
                            {['rubrics', 'summary', 'transcript', 'insights'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-4 text-sm font-semibold uppercase tracking-wider transition-all relative
                                        ${activeTab === tab ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-200'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="activeTab" 
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" 
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 min-h-[500px] max-w-none">
                            {activeTab === 'rubrics' && (
                                <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                                    {/* Global Score & Vision Card */}
                                    <div className="relative p-10 rounded-[3rem] bg-slate-900 shadow-2xl overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-l from-indigo-500/20 via-transparent to-transparent -rotate-12 translate-x-12" />
                                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] group-hover:bg-indigo-600/20 transition-all duration-1000" />
                                        
                                        <div className="relative flex flex-col lg:flex-row items-center gap-16">
                                            {/* Advanced Circle Gauge */}
                                            <div className="relative w-72 h-72 flex-shrink-0">
                                                <div className="absolute inset-0 rounded-full border-[1.5rem] border-white/5 shadow-inner" />
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <defs>
                                                            <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                                                                <stop offset="0%" stopColor="#818cf8" />
                                                                <stop offset="100%" stopColor="#c084fc" />
                                                            </linearGradient>
                                                        </defs>
                                                        <Pie
                                                            data={[
                                                                { value: ((analysis.evaluation_rubrics?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (analysis.evaluation_rubrics?.length || 1)) || 0), fill: 'url(#gaugeGradient)' },
                                                                { value: (10 - ((analysis.evaluation_rubrics?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (analysis.evaluation_rubrics?.length || 1)) || 0)), fill: 'rgba(255,255,255,0.05)' }
                                                            ]}
                                                            cx="50%" cy="50%" innerRadius={90} outerRadius={110}
                                                            startAngle={225} endAngle={-45} paddingAngle={0} dataKey="value" stroke="none"
                                                            cornerRadius={20}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <motion.span 
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 leading-none drop-shadow-2xl"
                                                    >
                                                        {((analysis.evaluation_rubrics?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (analysis.evaluation_rubrics?.length || 1)) || 0).toFixed(1)}
                                                    </motion.span>
                                                    <div className="mt-2 px-6 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Total Score</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Feature Vision / Radar */}
                                            <div className="flex-1 space-y-6 w-full">
                                                <div className="space-y-2">
                                                    <h3 className="text-4xl font-black text-white tracking-tight">Performance Breakdown</h3>
                                                    <p className="text-slate-400 font-medium">Multi-dimensional analysis of content quality and depth.</p>
                                                </div>
                                                <div className="h-64 w-full bg-white/[0.02] border border-white/5 rounded-3xl p-4 backdrop-blur-sm">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={(analysis.evaluation_rubrics || []).map(r => ({ subject: r.criteria, A: r.score, fullMark: 10 }))}>
                                                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} />
                                                            <Radar name="Score" dataKey="A" stroke="#818cf8" strokeWidth={3} fill="#818cf8" fillOpacity={0.2} animationDuration={1500} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Metrics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {(analysis.evaluation_rubrics || []).map((rubric, idx) => {
                                            const score = rubric.score || 0;
                                            const isExcellent = score >= 8;
                                            const isGood = score >= 6;
                                            
                                            // Dynamic Colors for Neon Effect
                                            const primaryColor = isExcellent ? '#10b981' : isGood ? '#6366f1' : '#f43f5e';
                                            const bgColor = isExcellent ? 'from-emerald-500/10' : isGood ? 'from-indigo-500/10' : 'from-rose-500/10';

                                            return (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className={`group relative p-8 rounded-[2rem] border border-white/10 bg-gradient-to-br ${bgColor} to-slate-900 hover:scale-[1.02] transition-all duration-500 overflow-hidden text-slate-100`}
                                                >
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                                        <Award size={64} style={{ color: primaryColor }} />
                                                    </div>

                                                    <div className="relative space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Metric {idx + 1}</span>
                                                                <h4 className="text-xl font-black tracking-tight">{rubric.criteria}</h4>
                                                            </div>
                                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-lg">
                                                                <span className="text-2xl font-black" style={{ color: primaryColor }}>{score}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                                <span>Efficiency Path</span>
                                                                <span>{score * 10}% Accurate</span>
                                                            </div>
                                                            <div className="h-4 w-full bg-white/5 rounded-full p-1 overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${score * 10}%` }}
                                                                    transition={{ duration: 1, delay: 0.5 }}
                                                                    className="h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-end px-2"
                                                                    style={{ 
                                                                        background: `linear-gradient(90deg, transparent, ${primaryColor})`,
                                                                        boxShadow: `0 0 10px ${primaryColor}40`
                                                                    }}
                                                                >
                                                                    <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                                                                </motion.div>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm text-slate-400 leading-relaxed italic group-hover:text-slate-300 transition-colors">
                                                            "{rubric.justification}"
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        {(!analysis.evaluation_rubrics || analysis.evaluation_rubrics.length === 0) && (
                                            <p className="text-slate-500 italic col-span-full text-center p-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-300">
                                                No evaluation data available. Our AI engine is currently analyzing the content structure.
                                            </p>
                                        )}
                                    </div>

                                    {/* Quick Summary Prompt */}
                                    <div className="p-8 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 text-white flex flex-col md:flex-row items-center gap-8 border border-white/10">
                                        <div className="w-20 h-20 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center">
                                            <Zap size={40} className="fill-white" />
                                        </div>
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <h4 className="text-2xl font-black">Ready to scale this analysis?</h4>
                                            <p className="text-indigo-100/80 font-medium">Export this report with all diagrams included for your professional presentation.</p>
                                        </div>
                                        <button className="px-8 py-4 bg-white text-indigo-600 rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
                                            Scale Deployment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-violet-500/20 shadow-2xl overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[2.5rem]" />
                                        <div className="relative p-10 space-y-8 bg-white/60 rounded-[2.5rem] border border-white/40">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                                    <FileText className="text-white" size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Executive Summary</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">High-Level Analysis Overview</p>
                                                </div>
                                            </div>

                                            <p className="text-xl text-slate-700 leading-relaxed font-medium italic border-l-4 border-indigo-500/40 pl-8 py-2 relative">
                                                <span className="absolute -left-2 top-0 text-6xl text-indigo-500/10 leading-none">"</span>
                                                {analysis.summary}
                                            </p>

                                            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-100 flex flex-col gap-4">
                                                <div className="flex items-center gap-2 text-indigo-500">
                                                    <TrendingUp size={20} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Context</span>
                                                </div>
                                                <p className="text-slate-600 leading-loose text-base whitespace-pre-wrap">
                                                    {analysis.detailed_summary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'transcript' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                                            <Mic size={20} className="text-pink-400" /> Full {type === 'video' ? 'Transcript' : 'Content'}
                                        </h3>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-sm text-slate-600 leading-loose h-[600px] overflow-y-auto shadow-inner">
                                            {transcript || content}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-100 space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                                    <Lightbulb className="text-white" size={24} />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900">Actionable Insights</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {(analysis.actionable_insights || []).map((insight, idx) => (
                                                    <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group overflow-hidden relative">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="w-8 h-8 rounded-full bg-indigo-500 text-white flex flex-shrink-0 items-center justify-center text-xs font-black shadow-md shadow-indigo-500/20">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm text-slate-700 font-medium leading-relaxed">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white border border-indigo-700 shadow-2xl shadow-indigo-600/20 space-y-8 overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                                            <div className="relative flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center p-2.5">
                                                    <PieChartIcon className="text-white h-full w-full" />
                                                </div>
                                                <h3 className="text-xl font-black">Sentiment & Context</h3>
                                            </div>
                                            <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 h-full">
                                                <p className="text-white text-lg leading-relaxed italic border-l-2 border-white/30 pl-6 h-full">
                                                    {analysis.sentiment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Topics Covered</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.topics.map((topic, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.keywords.map((kw, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                        <Hash size={10} className="inline mr-1" />{kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Key Takeaways</h3>
                            <ul className="space-y-3">
                                {analysis.key_points.map((pt, idx) => (
                                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="text-indigo-400" />
                            <h3 className="font-bold text-white">Chat with AI</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                            Questions about this {type}? Our AI has indexed the full content and is ready to answer anything.
                        </p>
                        <button className="w-full glass-button bg-indigo-600 hover:bg-indigo-500">
                            Start Chat Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResult;
