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
    Award
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

                        <div className="p-8 min-h-[500px] prose prose-invert max-w-none">
                            {activeTab === 'rubrics' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-slate-50 to-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-inner">
                                        {/* Left: Overall Quality Gauge */}
                                        <div className="relative w-[280px] h-[280px] flex flex-col items-center justify-center p-6 bg-white rounded-[2rem] shadow-xl shadow-indigo-500/5 border border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Overall Grade</h4>
                                            <div className="w-full h-full relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { value: (analysis.evaluation_rubrics.reduce((acc, curr) => acc + (curr.score || 0), 0) / analysis.evaluation_rubrics.length) || 0, fill: '#6366f1' },
                                                                { value: 10 - ((analysis.evaluation_rubrics.reduce((acc, curr) => acc + (curr.score || 0), 0) / analysis.evaluation_rubrics.length) || 0), fill: '#f1f5f9' }
                                                            ]}
                                                            cx="50%" cy="50%" innerRadius={70} outerRadius={90}
                                                            startAngle={180} endAngle={-180} dataKey="value" stroke="none"
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center group pointer-events-none">
                                                    <span className="text-6xl font-black text-slate-900 group-hover:scale-110 transition-transform">
                                                        {((analysis.evaluation_rubrics.reduce((acc, curr) => acc + (curr.score || 0), 0) / analysis.evaluation_rubrics.length) || 0).toFixed(1)}
                                                    </span>
                                                    <span className="text-slate-400 text-sm font-bold mt-1">out of 10</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                                                PRIME RATING
                                            </div>
                                        </div>

                                        {/* Right: Radar Chart for dimensions */}
                                        <div className="flex-1 w-full h-[320px] bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Performance Breakdown</h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={analysis.evaluation_rubrics}>
                                                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                                    <PolarAngleAxis dataKey="criteria" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 10]} hide />
                                                    <Radar
                                                        name="Performance"
                                                        dataKey="score"
                                                        stroke="#6366f1"
                                                        fill="#6366f1"
                                                        fillOpacity={0.15}
                                                        strokeWidth={3}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Evaluation Criteria Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(analysis.evaluation_rubrics || []).map((rubric, idx) => {
                                            const score = rubric.score || 0;
                                            const colors = score >= 8 ? 'from-emerald-500 to-emerald-600 text-emerald-600 font-black' : score >= 6 ? 'from-indigo-500 to-blue-600 text-indigo-600 font-bold' : score >= 4 ? 'from-amber-400 to-amber-500 text-amber-600 font-bold' : 'from-rose-500 to-red-600 text-rose-600 font-black';
                                            return (
                                                <motion.div 
                                                    key={idx} 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="p-6 rounded-[2rem] bg-white border border-slate-200/80 shadow-lg shadow-slate-100 flex flex-col justify-between group hover:shadow-2xl hover:border-indigo-200 transition-all duration-300"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Metric {idx + 1}</p>
                                                            <h5 className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{rubric.criteria}</h5>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-2xl ${colors.split(' ').pop()}`}>
                                                                {score}<span className="text-sm opacity-50">/10</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="my-6 space-y-1.5">
                                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-50">
                                                            <div className={`bg-gradient-to-r ${colors.split(' ').slice(0, 2).join(' ')} h-full rounded-full transition-all duration-1000`} style={{width: `${score * 10}%`}} />
                                                        </div>
                                                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                            <span>Poor</span>
                                                            <span>Mastery</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                        {rubric.justification}
                                                    </p>
                                                </motion.div>
                                            );
                                        })}
                                        {(!analysis.evaluation_rubrics || analysis.evaluation_rubrics.length === 0) && (
                                            <p className="text-slate-500 italic col-span-2 text-center p-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-300">
                                                No evaluation data available. Our AI engine is currently analyzing the content structure.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                            <FileText className="text-indigo-400" size={20} /> Overview
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed text-lg italic border-l-4 border-indigo-500/30 pl-4 py-1">
                                            {analysis.summary}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                            <TrendingUp className="text-purple-400" size={20} /> In-Depth Analysis
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                            {analysis.detailed_summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'transcript' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                            <Mic size={20} className="text-pink-400" /> Full {type === 'video' ? 'Transcript' : 'Content'}
                                        </h3>
                                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 font-mono text-sm text-slate-400 leading-loose h-[600px] overflow-y-auto">
                                            {transcript || content}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                                <Lightbulb className="text-yellow-400" size={18} /> Actionable Insights
                                            </h3>
                                            <div className="space-y-3">
                                                {analysis.actionable_insights.map((insight, idx) => (
                                                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex flex-shrink-0 items-center justify-center text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm text-slate-300">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                                <PieChart className="text-green-400" size={18} /> Key Sentiment
                                            </h3>
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-full">
                                                <p className="text-slate-300 text-sm leading-relaxed">{analysis.sentiment}</p>
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
