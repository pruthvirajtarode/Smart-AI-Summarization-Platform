import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import AnalysisResult from './pages/AnalysisResult';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result/:id" element={<AnalysisResult />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

// Simple placeholders for other pages
const HistoryPage = () => (
    <div className="glass p-8 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Analysis History</h2>
        <p className="text-slate-400 italic">History records will appear here as you analyze more videos.</p>
    </div>
);

const SettingsPage = () => (
    <div className="glass p-8 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h3 className="font-medium">API Configuration</h3>
                <p className="text-sm text-slate-500 mt-1">OpenAI API Key is managed via backend environment variables.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <h3 className="font-medium">Account Preferences</h3>
                <p className="text-sm text-slate-500 mt-1">Manage your notification and display preferences.</p>
            </div>
        </div>
    </div>
);

export default App;
