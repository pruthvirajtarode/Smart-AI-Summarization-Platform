import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';
import HistoryPanel from './components/HistoryPanel';
import AnalysisResult from './components/AnalysisResult';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
    const [history, setHistory] = useState([]);
    const [currentProcess, setCurrentProcess] = useState(null);
    const [view, setView] = useState('upload'); // upload, result, history

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/v1/uploads');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleUploadComplete = (processId) => {
        setCurrentProcess(processId);
        setView('result');
        fetchHistory();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/40">
            {/* Animated Glow Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <Navbar currentView={view} setView={setView} />

            <main className="relative max-w-7xl mx-auto px-4 pt-24 pb-12">
                <AnimatePresence mode="wait">
                    {view === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <UploadSection onUploadComplete={handleUploadComplete} />
                        </motion.div>
                    )}

                    {view === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <AnalysisResult processId={currentProcess} onBack={() => setView('upload')} />
                        </motion.div>
                    )}

                    {view === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <HistoryPanel items={history} onSelect={(id) => {
                                setCurrentProcess(id);
                                setView('result');
                            }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="relative mt-auto border-t border-white/5 py-8 text-center text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Smart Content Analyzer. Built with GPT-4o & Whisper.
            </footer>
        </div>
    );
};

export default App;
