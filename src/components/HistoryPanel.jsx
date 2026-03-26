import React from 'react';
import { 
    Clock, 
    FileVideo, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    ChevronRight,
    Youtube
} from 'lucide-react';

const HistoryPanel = ({ items, onSelect }) => {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center opacity-60">
                <Clock size={48} className="text-slate-500" />
                <div>
                    <h2 className="text-xl font-bold">No History Yet</h2>
                    <p className="text-slate-400">Everything you process will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">History</h1>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400">
                    Showing latest {items.length} records
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div 
                        key={item.process_id} 
                        onClick={() => onSelect(item.process_id)}
                        className="glass-card p-6 flex flex-col gap-6 cursor-pointer group hover:bg-white/[0.08] transition-all hover:-translate-y-1 hover:border-indigo-500/50"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110
                                ${item.type === 'video' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}
                            >
                                {item.type === 'video' ? (
                                    item.video_url ? <Youtube size={24} /> : <FileVideo size={24} />
                                ) : (
                                    <FileText size={24} />
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-[10px] font-bold uppercase tracking-widest">
                                {item.status === 'completed' && <CheckCircle2 size={12} className="text-green-500" />}
                                {item.status === 'failed' && <XCircle size={12} className="text-red-500" />}
                                {item.status === 'processing' && <Loader2 size={12} className="text-indigo-400 animate-spin" />}
                                <span className={item.status === 'failed' ? 'text-red-400' : item.status === 'completed' ? 'text-green-400' : 'text-indigo-400'}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                                {item.filename || (item.video_url ? "YouTube Video" : "Document Analysis")}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        {item.analysis && (
                            <div className="pt-4 border-t border-white/5 h-16">
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {item.analysis.summary}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-end group/btn">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 group-hover/btn:gap-2 transition-all">
                                View Details <ChevronRight size={14} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
