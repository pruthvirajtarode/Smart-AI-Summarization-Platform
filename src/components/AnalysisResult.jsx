import React, { useState, useEffect, useCallback } from 'react';
import { 
    Download, 
    ChevronLeft, 
    FileText, 
    MessageSquare, 
    Mic, 
    PieChart, 
    Hash, 
    TrendingUp, 
    Lightbulb,
    Loader2,
    Calendar,
    Clock,
    User,
    PlayCircle
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const AnalysisResult = ({ processId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleChatSend = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const res = await axios.post(`/api/v1/chat/${processId}`, { message: userMsg });
            setChatMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }]);
        }
        setIsChatLoading(false);
    };

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
                <Loader2 className="animate-spin text-indigo-500" size={64} />
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Analyzing Your Content...</h2>
                    <p className="text-slate-600">Our AI agents are working their magic. This may take a minute.</p>
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
                    <p className="text-slate-600 max-w-md mt-2">{data?.error || "We couldn't process your request. Please try again with a different file."}</p>
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
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {filename || (video_url ? "YouTube Video" : "Document Analysis")}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="flex border-b border-slate-200 bg-slate-50">
                            {['summary', 'transcript', 'insights'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-4 text-sm font-semibold uppercase tracking-wider transition-all relative
                                        ${activeTab === tab ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
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

                        <div className="p-8 min-h-[500px] prose  max-w-none">
                            {activeTab === 'summary' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                                            <FileText className="text-indigo-400" size={20} /> Overview
                                        </h3>
                                        <p className="text-slate-700 leading-relaxed text-lg italic border-l-4 border-indigo-500/30 pl-4 py-1">
                                            {analysis.summary}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                                            <TrendingUp className="text-purple-400" size={20} /> In-Depth Analysis
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {analysis.detailed_summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'transcript' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                                            <Mic size={20} className="text-pink-400" /> Full {type === 'video' ? 'Transcript' : 'Content'}
                                        </h3>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-sm text-slate-600 leading-loose h-[600px] overflow-y-auto">
                                            {transcript || content}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                                                <Lightbulb className="text-yellow-400" size={18} /> Actionable Insights
                                            </h3>
                                            <div className="space-y-3">
                                                {analysis.actionable_insights.map((insight, idx) => (
                                                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                                                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex flex-shrink-0 items-center justify-center text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm text-slate-700">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                                                <PieChart className="text-green-400" size={18} /> Key Sentiment
                                            </h3>
                                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 h-full">
                                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.sentiment}</p>
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
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs border border-slate-200 hover:bg-white/10 transition-colors cursor-default">
                                        <Hash size={10} className="inline mr-1" />{kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Key Takeaways</h3>
                            <ul className="space-y-3">
                                {analysis.key_points.map((pt, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Chat with AI */}
                    <div className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="text-indigo-600" />
                            <h3 className="font-bold text-slate-900">Chat with AI</h3>
                        </div>

                        {/* Chat Messages */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                            {chatMessages.length === 0 && (
                                <p className="text-slate-500 text-sm italic">Ask anything about this {type}...</p>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
                                        <Loader2 size={16} className="animate-spin text-indigo-500" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleChatSend} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask a question..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="flex-1 bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isChatLoading}
                                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResult;
