import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Youtube, FileText, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const UploadSection = ({ onUploadComplete }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        
        const isVideo = file.type.startsWith('video/');
        const isDoc = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'text/plain';

        let endpoint = '';
        if (isVideo) {
            formData.append('video_file', file);
            endpoint = '/api/v1/process/video';
        } else if (isDoc) {
            formData.append('doc_file', file);
            endpoint = '/api/v1/process/document';
        } else {
            console.error('Unsupported file type');
            setIsUploading(false);
            return;
        }

        try {
            const res = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            onUploadComplete(res.data.process_id);
        } catch (err) {
            console.error('Upload failed', err);
            setIsUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'video/*': ['.mp4', '.mkv', '.mov'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        }
    });

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        if (!videoUrl) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('video_url', videoUrl);
            const res = await axios.post('/api/v1/process/video', formData);
            onUploadComplete(res.data.process_id);
        } catch (err) {
            console.error('URL submittion failed', err);
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Analyze Your Content with AI
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Upload a video, document, or paste a YouTube link to get a detailed structured analysis, key insights, and more.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* File Upload Area */}
                <div 
                    {...getRootProps()} 
                    className={`glass-card p-12 flex flex-col items-center justify-center border-dashed border-2 cursor-pointer transition-all h-[350px]
                        ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
                >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                        {isUploading ? <Loader2 className="animate-spin text-indigo-400" size={32} /> : <Upload className="text-indigo-400" size={32} />}
                    </div>
                    {isUploading ? (
                        <div className="text-center space-y-2">
                            <p className="font-semibold text-lg text-white">Uploading...</p>
                            <p className="text-slate-500">{uploadProgress}% complete</p>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <p className="font-semibold text-xl text-white">
                                {isDragActive ? 'Drop file to upload' : 'Drag & drop any file here'}
                            </p>
                            <p className="text-slate-400">MP4, PDF, DOCX, TXT</p>
                        </div>
                    )}
                </div>

                {/* URL Input Area */}
                <div className="glass-card p-12 h-[350px] flex flex-col justify-center gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                        <Youtube size={120} />
                    </div>
                    
                    <div className="space-y-2 relative z-10">
                        <h3 className="text-2xl font-bold flex items-center gap-2 text-white">
                            <Youtube className="text-red-500" />
                            YouTube Link
                        </h3>
                        <p className="text-slate-400">Paste any public video link to analyze</p>
                    </div>

                    <form onSubmit={handleUrlSubmit} className="space-y-4 relative z-10">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="https://youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                        <button 
                            disabled={isUploading || !videoUrl} 
                            type="submit"
                            className="w-full glass-button group"
                        >
                            {isUploading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Analyze Video <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-60 max-w-4xl mx-auto">
                <div className="p-4 flex flex-col items-center gap-2 text-center glass-card border-none bg-white/5">
                    <Zap className="text-indigo-400" size={24} />
                    <span className="text-xs uppercase tracking-widest font-bold">Fast Processing</span>
                </div>
                <div className="p-4 flex flex-col items-center gap-2 text-center glass-card border-none bg-white/5">
                    <FileText className="text-purple-400" size={24} />
                    <span className="text-xs uppercase tracking-widest font-bold">PDF, DOC & More</span>
                </div>
                <div className="p-4 flex flex-col items-center gap-2 text-center glass-card border-none bg-white/5">
                    <div className="w-6 h-6 border-2 border-green-400/50 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-xs uppercase tracking-widest font-bold">AI Summarization</span>
                </div>
            </div>
        </div>
    );
};

export default UploadSection;
