import { useEffect, useState } from "react";
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
  const [stats, setStats] = useState(null);

  const user = { email: "admin@example.com" };

  // Redirect to login if no session ID
  useEffect(() => {
    const sessionId =
      typeof window !== "undefined"
        ? localStorage.getItem("sessionId")
        : null;

    if (!sessionId) {
      window.location.href = "/account/signin";
      return;
    }

    // Fetch admin stats
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("Failed to load admin stats:", err);
      });
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-8 h-8 text-blue-600" />
              Admin Console
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
            <DashboardCard
              icon={Users}
              bg="bg-blue-100"
              iconColor="text-blue-600"
              value={stats.totalUsers}
              label="Total Users"
            />

            <DashboardCard
              icon={MessageCircle}
              bg="bg-green-100"
              iconColor="text-green-600"
              value={stats.totalConversations}
              label="Conversations"
            />

            <DashboardCard
              icon={Activity}
              bg="bg-purple-100"
              iconColor="text-purple-600"
              value={stats.totalMessages}
              label="Total Messages"
            />

            <DashboardCard
              icon={Database}
              bg="bg-orange-100"
              iconColor="text-orange-600"
              value={stats.cacheEntries}
              label="Cache Entries"
            />
          </div>

          {/* Cache Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cache Performance Box */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Cache Performance
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <Metric label="Cache Hit Rate">
                    {(stats.cacheHitRate * 100).toFixed(1)}%
                  </Metric>

                  <ProgressBar value={stats.cacheHitRate * 100} />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <MiniMetric value={stats.totalCacheHits} label="Cache Hits" />
                    <MiniMetric value={stats.totalCacheMisses} label="Cache Misses" />
                  </div>
                </div>
              </div>
            </div>

            {/* System Metrics Box */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  System Metrics
                </h2>
              </div>
              <div className="p-6 space-y-4 text-gray-600 text-sm">
                <Metric label="Messages Today">{stats.messagesToday}</Metric>
                <Metric label="Active Conversations">{stats.activeConversations}</Metric>
                <Metric label="Avg Response Time">
                  {stats.avgResponseTime
                    ? `${stats.avgResponseTime.toFixed(2)}ms`
                    : "N/A"}
                </Metric>
                <Metric label="Cache Storage">
                  {stats.cacheSize
                    ? `${(stats.cacheSize / 1024).toFixed(1)} KB`
                    : "N/A"}
                </Metric>
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
              {stats.topCachedQueries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No cached queries yet
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2">Query</th>
                      <th className="py-2 w-24">Hits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topCachedQueries.map((q, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 text-gray-800">{q.query}</td>
                        <td className="py-2 text-gray-900 font-medium">
                          {q.hits}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function DashboardCard({ icon: Icon, bg, iconColor, value, label }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{children}</span>
    </div>
  );
}

function MiniMetric({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
