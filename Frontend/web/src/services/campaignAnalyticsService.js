import api from "../utils/api";

/**
 * Campaign Analytics Service
 * Provides methods for fetching campaign analytics and statistics
 */
const campaignAnalyticsService = {
  /**
   * Get overall campaign overview statistics
   */
  getOverview: async () => {
    try {
      const response = await api.get("/campaign-analytics/overview");
      return response.data;
    } catch (error) {
      console.error("Error fetching campaign overview:", error);
      throw error;
    }
  },

  /**
   * Get engagement metrics
   * @param {number} period - Number of days to analyze (default: 30)
   */
  getEngagement: async (period = 30) => {
    try {
      const response = await api.get("/campaign-analytics/engagement", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching engagement metrics:", error);
      throw error;
    }
  },

  /**
   * Get status summary
   */
  getStatusSummary: async () => {
    try {
      const response = await api.get("/campaign-analytics/status-summary");
      return response.data;
    } catch (error) {
      console.error("Error fetching status summary:", error);
      throw error;
    }
  },

  /**
   * Get performance metrics for a specific period
   * @param {string} period - week, month, quarter, or year
   */
  getPerformance: async (period = "month") => {
    try {
      const response = await api.get(
        `/campaign-analytics/performance/${period}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      throw error;
    }
  },

  /**
   * Get reading materials overview
   */
  getMaterialsOverview: async () => {
    try {
      const response = await api.get("/campaign-analytics/materials-overview");
      return response.data;
    } catch (error) {
      console.error("Error fetching materials overview:", error);
      throw error;
    }
  },
};

export default campaignAnalyticsService;
