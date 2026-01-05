import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import BottomTabNavigator from "../../components/BottomNavigation";
import { Ionicons } from "@expo/vector-icons";
import { incidentService } from "../../services/apiService";
import { STATUS_LABELS, STATUS_COLORS } from "../../config/api";

const ReportStatus = () => {
  const navigation = useNavigation();
  const [expandedReport, setExpandedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await incidentService.getAll();
      
      // Transform API data to match component structure
      const transformedReports = response.data.map(incident => ({
        id: incident.id,
        type: formatReportType(incident.incident_type),
        status: incident.status,
        date: incident.incident_date,
        time: incident.created_at ? new Date(incident.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'N/A',
        location: incident.location || 'Location not specified',
        description: incident.description || 'No description provided',
        scheduledResponse: incident.scheduled_date 
          ? `${incident.scheduled_date} ${incident.scheduled_time || ''}` 
          : 'Not scheduled yet',
        officer: incident.assigned_catcher || 'Not assigned',
        contact: incident.reporter_contact || 'Not provided',
        icon: require("../../assets/icons/report_icon.png"),
      }));
      
      setReports(transformedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format report type for display
  const formatReportType = (type) => {
    const typeMap = {
      'incident': 'Incident Bite Report',
      'stray': 'Stray Animal',
      'lost': 'Lost Pet',
    };
    return typeMap[type] || type;
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleExpand = (reportId) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
    } else {
      setExpandedReport(reportId);
    }
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || "#7f8c8d";
  };

  const getStatusLabel = (status) => {
    return STATUS_LABELS[status] || status;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Report Status" showBackButton={true} onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FD7E14"]} />
          }
        >
          <Text style={styles.sectionTitle}>Your Reports</Text>

          {reports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No reports yet</Text>
              <Text style={styles.emptySubtext}>Your submitted reports will appear here</Text>
            </View>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Image source={report.icon} style={styles.reportIcon} />
                  <View style={styles.reportTitleContainer}>
                    <Text style={styles.reportType}>{report.type}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(report.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>

                <View style={styles.reportBasicInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color="#555" />
                    <Text style={styles.infoText}>{report.time}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#555" />
                    <Text style={styles.infoText}>{report.location}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => toggleExpand(report.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.detailsButtonText}>
                    {expandedReport === report.id ? "Hide Details" : "View Details"}
                  </Text>
                  <Ionicons
                    name={expandedReport === report.id ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#FD7E14"
                  />
                </TouchableOpacity>

                {expandedReport === report.id && (
                  <View style={styles.reportDetails}>
                    <Text style={styles.detailTitle}>Report Description:</Text>
                    <Text style={styles.detailText}>{report.description}</Text>

                    <Text style={styles.detailTitle}>Scheduled Response:</Text>
                    <Text style={styles.detailText}>{report.scheduledResponse}</Text>

                    <Text style={styles.detailTitle}>Assigned Officer:</Text>
                    <Text style={styles.detailText}>{report.officer}</Text>

                    <Text style={styles.detailTitle}>Contact Number:</Text>
                    <Text style={styles.detailText}>{report.contact}</Text>

                    {report.status === "verified" && (
                      <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="call-outline" size={18} color="#fff" />
                        <Text style={styles.contactButtonText}>Contact Officer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reportIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 3,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  reportDate: {
    fontSize: 12,
    color: "#888",
  },
  reportBasicInfo: {
    marginLeft: 34, // Align with icon
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 5,
  },
  detailsButtonText: {
    color: "#FD7E14",
    fontWeight: "500",
    marginRight: 5,
  },
  reportDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailTitle: {
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 3,
  },
  detailText: {
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FD7E14",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default ReportStatus;
