import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Youtube, FileText, FileVideo, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const UploadSection = ({ onUploadComplete }) => {
    const [mode, setMode] = useState('file'); // 'file' or 'url'
    const [videoUrl, setVideoUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        setError('');
        setSelectedFile(acceptedFiles[0] || null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'video/mp4': ['.mp4'],
            'audio/mpeg': ['.mp3'],
            'audio/m4a': ['.m4a'],
            'audio/wav': ['.wav'],
            'audio/webm': ['.webm'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        }
    });

    const handleAnalyze = async () => {
        setError('');
        if (mode === 'file' && !selectedFile) {
            setError('Please select a file first.');
            return;
        }
        if (mode === 'url' && !videoUrl.trim()) {
            setError('Please enter a video URL.');
            return;
        }

        setIsProcessing(true);
        try {
            const formData = new FormData();
            let endpoint = '';

            if (mode === 'file') {
                // Check file size - Vercel limits to ~4.5MB
                if (selectedFile.size > 4 * 1024 * 1024) {
                    setError('File is too large (max 4MB). Please upload a smaller file.');
                    setIsProcessing(false);
                    return;
                }

                const isVideo = selectedFile.type.startsWith('video/');
                if (isVideo) {
                    formData.append('video_file', selectedFile);
                    endpoint = '/api/v1/process/video';
                } else {
                    formData.append('doc_file', selectedFile);
                    endpoint = '/api/v1/process/document';
                }
            } else {
                let url = videoUrl.trim();
                // Fix: Prepend https:// if protocol is missing
                if (url && !url.includes('://')) {
                    url = 'https://' + url;
                }
                formData.append('video_url', url);
                endpoint = '/api/v1/process/video';
            }

            const res = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000,
            });
            onUploadComplete(res.data.process_id);
        } catch (err) {
            console.error('Processing failed', err);
            const status = err?.response?.status;
            let msg = err?.response?.data?.detail || 'Processing failed. Please try again.';
            if (status === 413) {
                msg = 'File is too large for processing. Please upload a file under 4MB.';
            } else if (status === 504 || err.code === 'ECONNABORTED') {
                msg = 'Processing timed out. Try a smaller document.';
            }
            setError(msg);
            setIsProcessing(false);
        }
    };

    const fileIcon = selectedFile
        ? selectedFile.type.startsWith('video/') ? <FileVideo size={28} className="text-indigo-600" />
        : <FileText size={28} className="text-indigo-600" />
        : null;

    return (
        <div className="flex flex-col items-center gap-10 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Analyze Your Content with AI
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Upload a document or video to get a full AI-powered summary, key insights, and actionable takeaways.
                </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1.5 w-full max-w-xs">
                <button
                    onClick={() => { setMode('file'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                        ${mode === 'file' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Upload size={16} /> File Upload
                </button>
                <button
                    onClick={() => { setMode('url'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                        ${mode === 'url' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Youtube size={16} /> Video URL
                </button>
            </div>

            {/* Upload Card */}
            <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 p-10 flex flex-col items-center gap-6">
                {mode === 'file' ? (
                    <div
                        {...getRootProps()}
                        className={`w-full flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                            ${isDragActive
                                ? 'border-indigo-500 bg-indigo-50'
                                : selectedFile
                                    ? 'border-indigo-400 bg-indigo-50/50'
                                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            {isProcessing
                                ? <Loader2 className="animate-spin text-indigo-600" size={32} />
                                : selectedFile
                                    ? fileIcon
                                    : <Upload className="text-indigo-600" size={32} />
                            }
                        </div>

                        {selectedFile ? (
                            <div className="text-center">
                                <p className="font-bold text-slate-800 text-lg">{selectedFile.name}</p>
                                <p className="text-slate-500 text-sm mt-1">{(selectedFile.size / 1024).toFixed(1)} KB — Click to change file</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="font-bold text-slate-800 text-lg">
                                    {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                                </p>
                                <p className="text-slate-400 text-sm mt-1">Supports PDF, DOCX, TXT, MP4, MOV, MKV</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Video URL</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 transition-all">
                            <Youtube size={20} className="text-red-500 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="https://youtube.com/watch?v=... or direct video URL"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-400">⚠️ For YouTube links, please download the file locally and use File Upload instead.</p>
                    </div>
                )}

                {/* Professional Error Message */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-rose-50 border border-rose-100 rounded-2xl px-6 py-4 flex items-start gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-rose-600">!</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-rose-900 leading-none">Action Required</p>
                            <p className="text-xs text-rose-600 font-medium">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Single Centered Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={isProcessing || (mode === 'file' && !selectedFile) || (mode === 'url' && !videoUrl.trim())}
                    className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-indigo-600 text-white font-bold text-lg
                               hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/25
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 size={22} className="animate-spin" />
                            Analyzing Content... Please wait
                        </>
                    ) : (
                        <>
                            <Sparkles size={22} />
                            Analyze with AI
                        </>
                    )}
                </button>

                {isProcessing && (
                    <div className="space-y-4 w-full">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: ['-100%', '100%'] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="h-full w-1/3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest leading-relaxed">
                            AI Processing Active • Max 4MB (Vercel Limit) • Please stay on this page
                        </p>
                    </div>
                )}
            </div>

            {/* Feature Badges */}
            <div className="flex items-center gap-6 text-center text-xs text-slate-400 font-semibold uppercase tracking-widest">
                <span>⚡ Fast Processing</span>
                <span>•</span>
                <span>📄 PDF, DOCX, TXT</span>
                <span>•</span>
                <span>🤖 GPT-4o Powered</span>
            </div>
        </div>
    );
};

export default UploadSection;
