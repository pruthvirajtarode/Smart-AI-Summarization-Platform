import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line,
    PieChart, Pie, Cell
} from 'recharts';
import { 
    Award, TrendingUp, Zap, MessageSquare, BookOpen, 
    ChevronLeft, Download, Share2, Sparkles, AlertCircle, Quote,
    LineChart as LineChartIcon, PieChart as PieChartIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const AnalysisResult = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/analyze/result/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Result fetch error", err);
            }
        };
        fetchData();
    }, [id]);

    if (loading || !data) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-500">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="animate-pulse">Retrieving insights...</p>
        </div>
    );

    const { analysis, transcript } = data;
    const { metrics, style, strengths, weaknesses, suggestions } = analysis;

    const radarData = [
        { subject: 'Clarity', A: metrics.clarity * 10, fullMark: 100 },
        { subject: 'Engagement', A: metrics.engagement * 10, fullMark: 100 },
        { subject: 'Depth', A: metrics.depth * 10, fullMark: 100 },
        { subject: 'Communication', A: metrics.communication * 10, fullMark: 100 },
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    const barData = Object.entries(metrics)
        .filter(([key]) => key !== 'overall')
        .map(([key, value]) => ({ name: key.toUpperCase(), score: value }));

    const pieData = [
        { name: 'Clarity', value: metrics.clarity },
        { name: 'Engagement', value: metrics.engagement },
        { name: 'Depth', value: metrics.depth },
        { name: 'Comm.', value: metrics.communication },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Workspace
                </Link>
                <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-medium hover:bg-indigo-500/20 transition-all">
                       <Download className="w-4 h-4" /> Export Report
                   </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                    label="Overall Performance" 
                    value={`${metrics.overall}%`} 
                    icon={Award} 
                    color="text-indigo-400" 
                    gradient="from-indigo-500/20 to-indigo-500/5"
                />
                <MetricCard 
                    label="Teaching Style" 
                    value={style.type} 
                    icon={BookOpen} 
                    color="text-emerald-400"
                    gradient="from-emerald-500/20 to-emerald-500/5"
                />
                <MetricCard 
                    label="Confidence Level" 
                    value={style.confidence} 
                    icon={Zap} 
                    color="text-amber-400"
                    gradient="from-amber-500/20 to-amber-500/5"
                />
                <MetricCard 
                    label="Speech Speed" 
                    value={style.speed} 
                    icon={TrendingUp} 
                    color="text-slate-400"
                    gradient="from-slate-500/20 to-slate-500/5"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Radar Chart */}
                <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        Pedagogical Performance Overview
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Bar Chart */}
                <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3Icon className="w-4 h-4 text-emerald-400" />
                        Metric-wise Breakdown
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Line Chart */}
                <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <LineChartIcon className="w-4 h-4 text-sky-400" />
                        Metric Proximity Trend
                    </h3>
                    <div className="h-[250px] w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis domain={[0, 10]} stroke="#64748b" />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Pie Chart */}
                <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-amber-400" />
                        Component Distribution
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass p-8 rounded-3xl space-y-6">
                         <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-300">
                             <Sparkles className="w-5 h-5" />
                             Pedagogical Assessment
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-4">
                                 <h4 className="flex items-center gap-2 text-emerald-400 font-medium">
                                     <CheckCircle2Icon className="w-4 h-4" /> Key Strengths
                                 </h4>
                                 <ul className="space-y-3">
                                     {strengths.map((s, i) => (
                                         <li key={i} className="text-sm text-slate-400 flex gap-2">
                                             <span className="text-indigo-500 font-bold">•</span>
                                             {s}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                             <div className="space-y-4">
                                 <h4 className="flex items-center gap-2 text-red-400 font-medium">
                                     <AlertCircle className="w-4 h-4" /> Improvement Areas
                                 </h4>
                                 <ul className="space-y-3">
                                     {weaknesses.map((w, i) => (
                                         <li key={i} className="text-sm text-slate-400 flex gap-2">
                                             <span className="text-red-500 font-bold">•</span>
                                             {w}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         </div>
                         <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-white/5 italic text-slate-300">
                             <Quote className="w-6 h-6 text-indigo-500 mb-2" />
                             {analysis.summary}
                         </div>
                    </div>

                    <div className="glass p-8 rounded-3xl space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-sky-400" />
                            Instructor Recommendations
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {suggestions.map((s, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-xl border-l-2 border-l-indigo-500 flex items-center gap-4 transition-all hover:bg-white/10">
                                   <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                       {i+1}
                                   </div>
                                    <p className="text-sm text-slate-300">{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass p-8 rounded-3xl space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-400" />
                            Source Transcript
                        </h3>
                        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 text-xs text-slate-500 leading-relaxed custom-scrollbar">
                           {transcript}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, color, gradient }) => (
    <div className={`glass p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all`}>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} blur-2xl group-hover:scale-125 transition-transform`} />
        <div className="relative space-y-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
        </div>
    </div>
);

const CheckCircle2Icon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const BarChart3Icon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
);

const History = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

export default AnalysisResult;
