import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Settings, 
  LogOut,
  BarChart3,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: PlusCircle, label: 'New Analysis', path: '/analyze' },
        { icon: BarChart3, label: 'History', path: '/history' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 glass h-screen flex flex-col p-6 sticky top-0">
            <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-indigo-500 rounded-lg">
                    <Video className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold font-display gradient-text">PedagoPulse</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            location.pathname === item.path 
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-white/5">
                <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 w-full transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold">AI Instructor Analyzer</h2>
                        <p className="text-slate-400 text-sm">Optimize your teaching with AI-driven insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-full text-xs text-slate-400">
                            Credits: 120
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500" />
                    </div>
                </header>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default DashboardLayout;
