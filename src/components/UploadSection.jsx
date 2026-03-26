import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Youtube, FileText, Loader2, ArrowRight, Zap } from 'lucide-react';
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
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                    Analyze Your Content with AI
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed">
                    Upload a video, document, or paste a YouTube link to get a detailed structured analysis, key insights, and more.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* File Upload Area */}
                <div 
                    {...getRootProps()} 
                    className={`glass-card p-12 flex flex-col items-center justify-center border-dashed border-2 cursor-pointer transition-all h-[350px]
                        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                        {isUploading ? <Loader2 className="animate-spin text-indigo-600" size={32} /> : <Upload className="text-indigo-600" size={32} />}
                    </div>
                    {isUploading ? (
                        <div className="text-center space-y-2">
                            <p className="font-semibold text-lg text-slate-800">Processing Document...</p>
                            <p className="text-slate-500 text-sm">Our AI is analyzing. This may take up to 60 seconds.</p>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <p className="font-semibold text-xl text-slate-800">
                                {isDragActive ? 'Drop file to upload' : 'Drag & drop any file here'}
                            </p>
                            <p className="text-slate-500">MP4, PDF, DOCX, TXT</p>
                        </div>
                    )}
                </div>

                <div className="glass-card p-12 h-[350px] flex flex-col justify-center gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                        <Youtube size={120} className="text-red-500" />
                    </div>
                    
                    <div className="space-y-2 relative z-10">
                        <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                            <Youtube className="text-red-600" />
                            YouTube Link
                        </h3>
                        <p className="text-slate-500">Paste any public video link to analyze</p>
                    </div>

                    <form onSubmit={handleUrlSubmit} className="space-y-4 relative z-10">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="https://youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 p-4 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-4 flex flex-col items-center gap-2 text-center glass-card border flex-1 bg-white">
                    <Zap className="text-indigo-600" size={24} />
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-600">Fast Processing</span>
                </div>
                <div className="p-4 flex flex-col items-center gap-2 text-center glass-card border flex-1 bg-white">
                    <FileText className="text-indigo-600" size={24} />
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-600">PDF, DOC & More</span>
                </div>
                <div className="p-4 flex flex-col items-center gap-2 text-center glass-card border flex-1 bg-white">
                    <div className="w-6 h-6 border-2 border-green-500/50 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-600">AI Summarization</span>
                </div>
            </div>

        </div>
    );
};

export default UploadSection;
