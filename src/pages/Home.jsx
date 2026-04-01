import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link as LinkIcon, Cloud, FileVideo, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Auto-detect production environment to prevent Mixed Content errors
const isVercel = window.location.hostname.includes('vercel.app');
const API_BASE = isVercel ? '/api/analyze' : 'http://51.20.42.220:8000/api/analyze';

const Home = () => {
    const [url, setUrl] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(0);
    const [msg, setMsg] = useState("");
    const [jobId, setJobId] = useState(null);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles) => {
        setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {'video/mp4': ['.mp4'], 'video/quicktime': ['.mov']},
        maxFiles: 1
    });

    const pollStatus = async (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE}/status/${id}`);
                const data = res.data;
                setProgress(data.progress || 0);
                setMsg(data.message || "Processing...");
                
                if (data.status === "completed") {
                    clearInterval(interval);
                    navigate(`/result/${id}`);
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    setMsg("Analysis failed. Please try again.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 3000);
    };

    const handleUpload = async () => {
        if (!file && !url) return;
        
        // Vercel strict limit check for direct file uploads
        if (isVercel && file && file.size > 4.2 * 1024 * 1024) {
            setMsg("File too large for Vercel (4.5MB limit). Use the 'AI URL' option for large videos!");
            return;
        }

        setLoading(true);
        setStatus("starting");
        setMsg(""); 
        
        try {
            let res;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                res = await axios.post(`${API_BASE}/upload`, formData, {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                        setMsg(`Uploading Video... ${percentCompleted}%`);
                    }
                });
            } else {
                res = await axios.post(`${API_BASE}/url`, { url });
            }
            
            const id = res.data.job_id;
            setJobId(id);
            pollStatus(id);
        } catch (err) {
            console.error("Upload error", err);
            setLoading(false);
            if (err.response?.status === 413) {
                setMsg("File too large for Vercel. Please use a YouTube URL instead.");
            } else {
                setMsg(isVercel 
                    ? "Error starting analysis. Try a smaller file or a URL."
                    : "Error. Ensure backend is running at http://51.20.42.220:8000");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
                <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="text-xl font-medium flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        Upload Instructor Video
                    </h3>
                    
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                            isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <div className="p-4 bg-indigo-500/10 rounded-full">
                            <Cloud className="w-10 h-10 text-indigo-400" />
                        </div>
                        {file ? (
                            <div className="flex items-center gap-2 text-indigo-300">
                                <FileVideo className="w-4 h-4" />
                                <span className="font-medium">{file.name}</span>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-medium">Drag and drop video</p>
                                <p className="text-sm text-slate-500 mt-1">MP4, MOV up to 500MB</p>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-950 px-3 text-slate-500">Or AI URL</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-400 ml-1">Video Link (YouTube / S3)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text"
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleUpload}
                        disabled={loading || (!file && !url)}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                            loading 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20'
                        }`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? 'Analyzing Content...' : 'Analyze Performance'}
                    </button>
                </div>
                
                {(loading || msg) && (
                    <div className="glass p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-bottom-4 border-l-4 border-l-indigo-500">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                                <span className={`text-sm font-medium ${loading ? 'text-slate-300' : 'text-amber-500'}`}>{msg}</span>
                            </div>
                            {loading && <span className="text-xs font-mono text-indigo-400">{progress}%</span>}
                        </div>
                        {loading && (
                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">How it works</h4>
                {[
                    { title: "Voice Extraction", desc: "Advanced FFmpeg identifies pedagogical signal", icon: CheckCircle2 },
                    { title: "Whisper Transcription", desc: "Precision SOTA speech-to-text conversion", icon: CheckCircle2 },
                    { title: "Pedagogical Analysis", desc: "GPT-4o evaluates clarity, engagement & depth", icon: CheckCircle2 },
                    { title: "Visual Dashboard", desc: "Instant charts and actionable teaching feedback", icon: CheckCircle2 },
                ].map((step, i) => (
                    <div key={i} className="glass p-4 rounded-2xl flex items-start gap-4 border-l-4 border-l-indigo-500/50">
                        <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                            <step.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-slate-200">{step.title}</h5>
                            <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                        </div>
                    </div>
                ))}
                
                <div className="mt-8 bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl flex gap-4">
                   <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                   <div>
                       <p className="text-sm font-medium text-amber-500">Beta Version</p>
                       <p className="text-xs text-amber-600/80 mt-1">Complex audio with secondary speakers may affect the instructor score accuracy. Best used with single-instructor high-quality audio.</p>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
