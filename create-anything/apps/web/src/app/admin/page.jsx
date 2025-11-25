import { useEffect } from "react";
import {
  BarChart3,
  Database,
  MessageCircle,
  Users,
  Clock,
  Activity,
  TrendingUp,
  Server,
} from "lucide-react";

export default function AdminDashboard() {
  // Placeholder user
  const user = { email: "admin@example.com" };

  // Placeholder stats
  const stats = {
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    cacheEntries: 0,
    cacheHitRate: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    messagesToday: 0,
    activeConversations: 0,
    avgResponseTime: null,
    cacheSize: null,
    topCachedQueries: [],
  };

  // Redirect if no session
  useEffect(() => {
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;
    if (!sessionId) {
      window.location.href = "/account/signin";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-8 h-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back to Chat
              </a>
              <a
                href="/account/logout"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalConversations}</p>
                  <p className="text-sm text-gray-600">Conversations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
                  <p className="text-sm text-gray-600">Total Messages</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats.cacheEntries}</p>
                  <p className="text-sm text-gray-600">Cache Entries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Cache Performance
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cache Hit Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(stats.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${stats.cacheHitRate * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalCacheHits}</p>
                      <p className="text-xs text-gray-600">Cache Hits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalCacheMisses}</p>
                      <p className="text-xs text-gray-600">Cache Misses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  System Metrics
                </h2>
              </div>
              <div className="p-6 space-y-4 text-gray-600 text-sm">
                <div className="flex items-center justify-between">
                  <span>Messages Today</span>
                  <span>{stats.messagesToday}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Conversations</span>
                  <span>{stats.activeConversations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Response Time</span>
                  <span>{stats.avgResponseTime ? `${stats.avgResponseTime.toFixed(2)}ms` : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Storage</span>
                  <span>{stats.cacheSize ? `${(stats.cacheSize / 1024).toFixed(1)} KB` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Cached Queries */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Most Cached Queries
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-4">No cached queries yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
