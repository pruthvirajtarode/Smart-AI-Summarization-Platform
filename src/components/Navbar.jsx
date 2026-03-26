import React from 'react';
import { LayoutDashboard, History, UploadCloud, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Navbar = ({ currentView, setView }) => {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('upload')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                        <Zap className="text-white fill-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white/90">
                        Smart <span className="text-indigo-400">Analyzer</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setView('upload')}
                        className={twMerge(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5",
                            currentView === 'upload' ? "bg-white/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-5px_#6366f1]" : "text-slate-400"
                        )}
                    >
                        <UploadCloud size={18} />
                        Upload
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={twMerge(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5",
                            currentView === 'history' ? "bg-white/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-5px_#6366f1]" : "text-slate-400"
                        )}
                    >
                        <History size={18} />
                        History
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
