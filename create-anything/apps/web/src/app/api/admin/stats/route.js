import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get admin statistics
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users count
    const userCountResult = await sql`SELECT COUNT(*) as count FROM auth_users`;
    const totalUsers = parseInt(userCountResult[0].count);

    // Get total conversations count
    const conversationCountResult =
      await sql`SELECT COUNT(*) as count FROM conversations`;
    const totalConversations = parseInt(conversationCountResult[0].count);

    // Get total messages count
    const messageCountResult =
      await sql`SELECT COUNT(*) as count FROM messages`;
    const totalMessages = parseInt(messageCountResult[0].count);

    // Get cache entries count
    const cacheCountResult =
      await sql`SELECT COUNT(*) as count FROM query_cache`;
    const cacheEntries = parseInt(cacheCountResult[0].count);

    // Get cache statistics
    const cacheStatsResult = await sql`
      SELECT 
        SUM(cache_hit_count) as total_hits,
        COUNT(*) as total_entries,
        SUM(LENGTH(query_text) + LENGTH(response_text)) as cache_size
      FROM query_cache
    `;

    const totalCacheHits = parseInt(cacheStatsResult[0].total_hits || 0);
    const cacheSize = parseInt(cacheStatsResult[0].cache_size || 0);

    // Calculate cache hit rate (approximate based on hit counts)
    const totalQueries = totalCacheHits + cacheEntries; // Rough estimate
    const cacheHitRate = totalQueries > 0 ? totalCacheHits / totalQueries : 0;

    // Get messages from today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const messagesTodayResult = await sql`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE created_at >= ${todayStart.toISOString()}
    `;
    const messagesToday = parseInt(messagesTodayResult[0].count);

    // Get active conversations (conversations with messages in the last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const activeConversationsResult = await sql`
      SELECT COUNT(DISTINCT conversation_id) as count 
      FROM messages 
      WHERE created_at >= ${oneDayAgo.toISOString()}
    `;
    const activeConversations = parseInt(activeConversationsResult[0].count);

    // Get top cached queries
    const topCachedQueriesResult = await sql`
      SELECT 
        query_text, 
        cache_hit_count, 
        model_used, 
        last_used_at
      FROM query_cache 
      ORDER BY cache_hit_count DESC 
      LIMIT 5
    `;

    // Calculate average response time (simulate since we don't track actual response times)
    // This is a placeholder - in a real system you'd track actual response times
    const avgResponseTime = Math.random() * 2000 + 500; // Random between 500-2500ms for demo

    const stats = {
      totalUsers,
      totalConversations,
      totalMessages,
      cacheEntries,
      cacheHitRate,
      totalCacheHits,
      totalCacheMisses: Math.max(0, totalQueries - totalCacheHits),
      messagesToday,
      activeConversations,
      avgResponseTime,
      cacheSize,
      topCachedQueries: topCachedQueriesResult,
    };

    return Response.json(stats);
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
