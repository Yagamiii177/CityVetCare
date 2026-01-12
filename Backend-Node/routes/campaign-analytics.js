import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

/**
 * GET /api/campaign-analytics/overview
 * Returns overall campaign statistics
 */
router.get("/overview", async (req, res) => {
  try {
    // Get announcement stats
    const [announcementStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_announcements,
        SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archived,
        SUM(views) as total_views,
        AVG(views) as avg_views
      FROM announcement
    `);

    // Get reading materials stats
    const [materialsStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_materials,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN type = 'book' THEN 1 ELSE 0 END) as books,
        SUM(CASE WHEN type = 'website' THEN 1 ELSE 0 END) as websites,
        SUM(CASE WHEN type = 'digital' THEN 1 ELSE 0 END) as digital
      FROM reading_materials
    `);

    // Get category distribution for announcements
    const [categoryDist] = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(views) as total_views
      FROM announcement
      WHERE is_archived = 0
      GROUP BY category
    `);

    // Get priority distribution
    const [priorityDist] = await pool.query(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM announcement
      WHERE is_archived = 0
      GROUP BY priority
    `);

    // Get recent activity (last 30 days)
    const [recentActivity] = await pool.query(`
      SELECT 
        DATE(date_posted) as date,
        COUNT(*) as count,
        SUM(views) as views
      FROM announcement
      WHERE date_posted >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(date_posted)
      ORDER BY date DESC
    `);

    // Get top viewed announcements
    const [topViewed] = await pool.query(`
      SELECT 
        announcement_id,
        title,
        category,
        views,
        priority,
        date_posted
      FROM announcement
      WHERE is_archived = 0
      ORDER BY views DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        announcements: announcementStats[0],
        materials: materialsStats[0],
        categoryDistribution: categoryDist,
        priorityDistribution: priorityDist,
        recentActivity,
        topViewed,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching campaign overview:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch campaign analytics",
    });
  }
});

/**
 * GET /api/campaign-analytics/engagement
 * Returns engagement metrics
 */
router.get("/engagement", async (req, res) => {
  try {
    const { period = 30 } = req.query; // days

    // Get engagement trends
    const [engagementTrends] = await pool.query(
      `
      SELECT 
        DATE(date_posted) as date,
        COUNT(*) as announcements_posted,
        COALESCE(SUM(views), 0) as total_views,
        COALESCE(AVG(views), 0) as avg_views_per_announcement
      FROM announcement
      WHERE date_posted IS NOT NULL
        AND date_posted >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(date_posted)
      ORDER BY date ASC
    `,
      [period]
    );

    // Get category performance
    const [categoryPerformance] = await pool.query(
      `
      SELECT 
        category,
        COUNT(*) as total,
        COALESCE(SUM(views), 0) as total_views,
        COALESCE(AVG(views), 0) as avg_views,
        COALESCE(MAX(views), 0) as max_views
      FROM announcement
      WHERE date_posted IS NOT NULL
        AND date_posted >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND is_archived = 0
      GROUP BY category
      ORDER BY total_views DESC
    `,
      [period]
    );

    // Get author performance
    const [authorPerformance] = await pool.query(
      `
      SELECT 
        COALESCE(author, 'Unknown') as author,
        COUNT(*) as announcements_created,
        SUM(views) as total_views,
        AVG(views) as avg_views
      FROM announcement
      WHERE date_posted >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY COALESCE(author, 'Unknown')
      ORDER BY announcements_created DESC
      LIMIT 10
    `,
      [period]
    );

    res.json({
      success: true,
      data: {
        period,
        engagementTrends,
        categoryPerformance,
        authorPerformance,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching engagement metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch engagement metrics",
    });
  }
});

/**
 * GET /api/campaign-analytics/status-summary
 * Returns current status summary for campaigns
 */
router.get("/status-summary", async (req, res) => {
  try {
    // Get current status counts
    const [statusCounts] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(views) as total_views
      FROM announcement
      GROUP BY status
    `);

    // Get upcoming scheduled announcements
    const [upcoming] = await pool.query(`
      SELECT 
        announcement_id,
        title,
        category,
        priority,
        publish_date,
        COALESCE(author, 'Unknown') as author
      FROM announcement
      WHERE status = 'Scheduled'
        AND publish_date IS NOT NULL
        AND publish_date > NOW()
      ORDER BY publish_date ASC
      LIMIT 10
    `);

    // Get announcements needing attention (drafts older than 7 days)
    const [needsAttention] = await pool.query(`
      SELECT 
        announcement_id,
        title,
        category,
        priority,
        date_posted,
        COALESCE(author, 'Unknown') as author
      FROM announcement
      WHERE status = 'Draft'
        AND date_posted IS NOT NULL
        AND date_posted < DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY date_posted ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        statusCounts,
        upcoming,
        needsAttention,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching status summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch status summary",
    });
  }
});

/**
 * GET /api/campaign-analytics/performance/:period
 * Returns performance metrics for a specific period
 */
router.get("/performance/:period", async (req, res) => {
  try {
    const { period } = req.params; // week, month, quarter, year
    let days;

    switch (period) {
      case "week":
        days = 7;
        break;
      case "month":
        days = 30;
        break;
      case "quarter":
        days = 90;
        break;
      case "year":
        days = 365;
        break;
      default:
        days = 30;
    }

    // Get performance metrics
    const [metrics] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_announcements,
        COALESCE(SUM(views), 0) as total_views,
        COALESCE(AVG(views), 0) as avg_views,
        COALESCE(MAX(views), 0) as max_views,
        COALESCE(MIN(views), 0) as min_views,
        SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) as low_priority
      FROM announcement
      WHERE date_posted IS NOT NULL
        AND date_posted >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND is_archived = 0
    `,
      [days]
    );

    // Compare with previous period
    const [previousMetrics] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_announcements,
        COALESCE(SUM(views), 0) as total_views,
        COALESCE(AVG(views), 0) as avg_views
      FROM announcement
      WHERE date_posted IS NOT NULL
        AND date_posted >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND date_posted < DATE_SUB(NOW(), INTERVAL ? DAY)
        AND is_archived = 0
    `,
      [days * 2, days]
    );

    // Calculate growth rates
    const current = metrics[0];
    const previous = previousMetrics[0];

    const growth = {
      announcements:
        previous.total_announcements > 0
          ? ((current.total_announcements - previous.total_announcements) /
              previous.total_announcements) *
            100
          : 0,
      views:
        previous.total_views > 0
          ? ((current.total_views - previous.total_views) /
              previous.total_views) *
            100
          : 0,
      avgViews:
        previous.avg_views > 0
          ? ((current.avg_views - previous.avg_views) / previous.avg_views) *
            100
          : 0,
    };

    res.json({
      success: true,
      data: {
        period,
        days,
        current: current,
        previous: previous,
        growth,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance metrics",
    });
  }
});

/**
 * GET /api/campaign-analytics/materials-overview
 * Returns reading materials overview
 */
router.get("/materials-overview", async (req, res) => {
  try {
    // Get materials by type
    const [typeDistribution] = await pool.query(`
      SELECT 
        type,
        COUNT(*) as count,
        status
      FROM reading_materials
      GROUP BY type, status
    `);

    // Get recently added materials
    const [recentMaterials] = await pool.query(`
      SELECT 
        id,
        title,
        type,
        category,
        author,
        status,
        date_created
      FROM reading_materials
      ORDER BY date_created DESC
      LIMIT 10
    `);

    // Get materials by category
    const [categoryDist] = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM reading_materials
      WHERE status = 'published'
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        typeDistribution,
        recentMaterials,
        categoryDistribution: categoryDist,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching materials overview:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch materials overview",
    });
  }
});

export default router;
