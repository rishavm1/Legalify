"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Activity, MessageSquare, Upload, FileText, Search, TrendingUp } from 'lucide-react';

export function UsageDashboard() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    chatsToday: 0,
    uploadsToday: 0,
    researchCount: 0,
    memosGenerated: 0,
    argumentsGenerated: 0
  });

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs?limit=100');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        calculateStats(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const calculateStats = (logs: any[]) => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.created_at).toDateString() === today);

    setStats({
      totalActions: logs.length,
      chatsToday: todayLogs.filter(l => l.action === 'chat_message').length,
      uploadsToday: todayLogs.filter(l => l.action === 'file_upload').length,
      researchCount: logs.filter(l => l.action === 'legal_research').length,
      memosGenerated: logs.filter(l => l.action === 'generate_memo').length,
      argumentsGenerated: logs.filter(l => l.action === 'generate_argument').length
    });
  };

  const userRole = (session?.user as any)?.role || 'free';
  const userPlan = (session?.user as any)?.plan || 'free';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">Usage Dashboard</h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <TrendingUp className="w-4 h-4" />
          <span className="font-semibold capitalize">{userPlan} Plan</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Chats Today</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.chatsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploads Today</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.uploadsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Research Queries</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.researchCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Memos Generated</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.memosGenerated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Arguments Generated</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.argumentsGenerated}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Actions</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.totalActions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Limits */}
      {userPlan === 'free' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold text-black dark:text-white mb-2">Free Plan Limits</h3>
          <div className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <p>• 20 chats per day ({stats.chatsToday}/20 used today)</p>
            <p>• 5 file uploads per day ({stats.uploadsToday}/5 used today)</p>
            <p>• 3 memos per month ({stats.memosGenerated}/3 used)</p>
          </div>
          <button className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90">
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <h3 className="font-semibold text-black dark:text-white mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.slice(0, 10).map((log, i) => (
            <div key={i} className="flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-black dark:text-white">{log.action.replace(/_/g, ' ')}</span>
              </div>
              <span className="text-xs text-neutral-500">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
