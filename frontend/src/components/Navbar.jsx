import React from 'react';
import { LayoutDashboard, History, UploadCloud, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Navbar = ({ currentView, setView }) => {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('upload')}>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center p-2 transition-transform shadow-lg shadow-indigo-600/20">
                        <Zap className="text-white fill-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        Smart<span className="text-indigo-600">Analyzer</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setView('upload')}
                        className={twMerge(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-100",
                            currentView === 'upload' ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" : "text-slate-500"
                        )}
                    >
                        <UploadCloud size={18} />
                        Upload
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={twMerge(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-100",
                            currentView === 'history' ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" : "text-slate-500"
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
