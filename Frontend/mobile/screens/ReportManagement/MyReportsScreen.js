/**
 * My Reports Screen
 * Displays all incident reports submitted by the authenticated pet owner
 * Features: Filtering by status, status badges, and navigation to detail view
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { incidentService } from '../../services/apiService';
import ScreenHeader from '../../components/ScreenHeader';
import { useFocusEffect } from '@react-navigation/native';

const MyReportsScreen = ({ navigation, route }) => {
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const highlightIncidentId = route?.params?.highlightIncidentId;

  const filters = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFC107'; // Yellow
      case 'Scheduled':
        return '#2196F3'; // Blue
      case 'In Progress':
        return '#FF9800'; // Orange
      case 'Resolved':
        return '#4CAF50'; // Green
      case 'Rejected':
        return '#F44336'; // Red
      case 'Verified':
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Gray
    }
  };

  // Fetch reports from backend
  const fetchReports = useCallback(async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Authentication Required', 'Please log in to view your reports.');
      navigation.navigate('Login');
      return;
    }

    try {
      setIsLoading(true);
      // Use the new authenticated endpoint that gets reports automatically from token
      const response = await incidentService.getMyReports();
      
      const reportsData = response.data || [];
      setReports(reportsData);
      
      // Apply filter
      filterReports(reportsData, selectedFilter);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load your reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, selectedFilter]);

  // Filter reports by status
  const filterReports = (reportsData, filter) => {
    if (filter === 'All') {
      setFilteredReports(reportsData);
    } else {
      const filtered = reportsData.filter(
        (report) => report.status === filter
      );
      setFilteredReports(filtered);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    filterReports(reports, filter);
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

  // Handle navigation from notification to specific incident
  useFocusEffect(
    useCallback(() => {
      if (highlightIncidentId) {
        // If we have a highlighted incident ID from notification
        // Navigate directly to that incident's detail page
        setTimeout(() => {
          navigation.navigate('ReportDetail', { reportId: highlightIncidentId });
          // Clear the param after navigation
          navigation.setParams({ highlightIncidentId: undefined });
        }, 100);
      }
    }, [highlightIncidentId])
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format report type
  const formatReportType = (type) => {
    const typeMap = {
      bite: 'Incident Bite',
      stray: 'Stray Animal',
    };
    return typeMap[type] || type;
  };

  // Render report card
  const ReportCard = ({ report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() =>
        navigation.navigate('ReportDetail', { reportId: report.id })
      }
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <MaterialCommunityIcons
            name={
              report.incident_type === 'bite'
                ? 'alert-circle'
                : report.incident_type === 'stray'
                ? 'dog'
                : 'paw'
            }
            size={20}
            color="#FD7E14"
          />
          <Text style={styles.cardTitle}>
            {formatReportType(report.incident_type)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(report.status) },
          ]}
        >
          <Text style={styles.statusText}>{report.status}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={16}
            color="#666"
          />
          <Text style={styles.infoLabel}>Animal:</Text>
          <Text style={styles.infoValue}>{report.animal_type || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {report.location_address || 'Location not specified'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoLabel}>Submitted:</Text>
          <Text style={styles.infoValue}>
            {formatDate(report.created_at)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.catcherInfo}>
          <MaterialCommunityIcons
            name="account-hard-hat"
            size={18}
            color="#FD7E14"
          />
          <Text style={styles.catcherText}>
            {Array.isArray(report.assigned_catchers) && report.assigned_catchers.length > 0
              ? report.assigned_catchers.map(c => c.full_name).join(', ')
              : report.assigned_team || 'Not yet assigned'}
          </Text>
        </View>

        {report.patrol_status && (
          <View style={styles.patrolStatus}>
            <Text style={styles.patrolStatusText}>
              Patrol: {report.patrol_status}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#FD7E14" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="My Incident Reports"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Incident Reports"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(filter)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports List */}
      <View
        style={styles.View}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FD7E14']}
            tintColor="#FD7E14"
          />
        }
      >
        {filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color="#DDD"
            />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'All'
                ? "You haven't submitted any reports yet."
                : `No ${selectedFilter.toLowerCase()} reports.`}
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FD7E14',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },
  View: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardBody: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  catcherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catcherText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  patrolStatus: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  patrolStatusText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#FD7E14',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MyReportsScreen;
