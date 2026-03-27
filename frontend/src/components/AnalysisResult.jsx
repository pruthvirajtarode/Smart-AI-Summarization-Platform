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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="animate-spin text-indigo-600" size={64} />
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
                    <h2 className="text-2xl font-bold text-slate-900">Oops! Processing Failed</h2>
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
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
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
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    {/* Professional Score Card */}
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                            {/* Overall Gauge */}
                                            <div className="p-10 flex flex-col items-center justify-center bg-slate-50/50 min-w-[320px]">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Quality Score</h4>
                                                <div className="relative w-56 h-56">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { value: ((analysis.evaluation_rubrics?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (analysis.evaluation_rubrics?.length || 1)) || 0), fill: '#4f46e5' },
                                                                    { value: (10 - ((analysis.evaluation_rubrics?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (analysis.evaluation_rubrics?.length || 1)) || 0)), fill: '#f1f5f9' }
                                                                ]}
                                                                cx="50%" cy="50%" innerRadius={70} outerRadius={85}
                                                                startAngle={225} endAngle={-45} paddingAngle={0} dataKey="value" stroke="none"
                                                                cornerRadius={10}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-6xl font-black text-slate-900 tabular-nums">
                                                            {((analysis.evaluation_rubrics?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (analysis.evaluation_rubrics?.length || 1)) || 0).toFixed(1)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">out of 10</span>
                                                    </div>
                                                </div>
                                                <div className="mt-8 px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                    High Performance
                                                </div>
                                            </div>

                                            {/* Radar Breakdown */}
                                            <div className="flex-1 p-10 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-bold text-slate-900">Performance Matrix</h3>
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">AI Evaluation</span>
                                                </div>
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={(analysis.evaluation_rubrics || []).map(r => ({ subject: r.criteria, A: r.score, fullMark: 10 }))}>
                                                            <PolarGrid stroke="#e2e8f0" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                                            <Radar name="Score" dataKey="A" stroke="#4f46e5" strokeWidth={2} fill="#4f46e5" fillOpacity={0.1} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clean Metrics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(analysis.evaluation_rubrics || []).map((rubric, idx) => {
                                            const score = rubric.score || 0;
                                            const colorClass = score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-indigo-600' : 'text-rose-600';
                                            const barClass = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-indigo-500' : 'bg-rose-500';

                                            return (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                                                >
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Metric {idx+1}</span>
                                                            <h5 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{rubric.criteria}</h5>
                                                        </div>
                                                        <div className="text-3xl font-black text-slate-900 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl border border-slate-100">
                                                            {score}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 mb-6">
                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${score * 10}%` }}
                                                                transition={{ duration: 1, delay: 0.3 }}
                                                                className={`h-full rounded-full ${barClass}`}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                            <span>Poor</span>
                                                            <span className={colorClass}>Target</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                        {rubric.justification}
                                                    </p>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Banner */}
                                    <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <Award size={32} className="text-indigo-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-white text-xl font-bold">Comprehensive Analysis Complete</h4>
                                                <p className="text-slate-400 text-sm">Download the professional report to share your insights.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => window.open(`/api/v1/download/${processId}`, '_blank')}
                                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-2"
                                        >
                                            <Download size={20} /> Export Executive PDF
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 space-y-8">
                                        <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                                                <FileText className="text-indigo-600" size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Executive Summary</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">High-Level Analysis Overview</p>
                                            </div>
                                        </div>

                                        <p className="text-xl text-slate-700 leading-relaxed font-semibold italic pl-8 border-l-4 border-indigo-500/20">
                                            {analysis.summary}
                                        </p>

                                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <TrendingUp size={16} /> Technical Details
                                            </h4>
                                            <p className="text-slate-600 leading-loose text-base whitespace-pre-wrap">
                                                {analysis.detailed_summary}
                                            </p>
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
                                {(analysis.topics || []).map((topic, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {(analysis.keywords || []).map((kw, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                        <Hash size={10} className="inline mr-1" />{kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Key Takeaways</h3>
                            <ul className="space-y-3">
                                {(analysis.key_points || []).map((pt, idx) => (
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
