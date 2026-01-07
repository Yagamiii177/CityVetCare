/**
 * Report Detail Screen
 * Displays detailed information about a specific incident report
 * Read-only view for pet owners to track their report status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { incidentService } from '../../services/apiService';
import ScreenHeader from '../../components/ScreenHeader';

const { width } = Dimensions.get('window');

const ReportDetailScreen = ({ navigation, route }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFC107';
      case 'Scheduled':
        return '#2196F3';
      case 'In Progress':
        return '#FF9800';
      case 'Resolved':
        return '#4CAF50';
      case 'Rejected':
        return '#F44336';
      case 'Verified':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  // Fetch report details
  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setIsLoading(true);
        const response = await incidentService.getById(reportId);
        setReport(response.data || response);
      } catch (error) {
        console.error('Error fetching report details:', error);
        Alert.alert('Error', 'Failed to load report details.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatReportType = (type) => {
    const typeMap = {
      bite: 'Incident Bite Report',
      stray: 'Stray Animal Report',
      lost: 'Lost Pet Report',
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Report Details"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading report details...</Text>
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Report Details"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#DDD"
          />
          <Text style={styles.emptyText}>Report not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Report Details"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: getStatusColor(report.status) },
          ]}
        >
          <MaterialCommunityIcons
            name={
              report.status === 'Resolved'
                ? 'check-circle'
                : report.status === 'Rejected'
                ? 'close-circle'
                : report.status === 'In Progress'
                ? 'progress-clock'
                : 'alert-circle'
            }
            size={24}
            color="#FFF"
          />
          <Text style={styles.statusBannerText}>{report.status}</Text>
        </View>

        {/* Report Type & ID */}
        <View style={styles.section}>
          <Text style={styles.reportType}>
            {formatReportType(report.report_type || report.incident_type)}
          </Text>
          <Text style={styles.reportId}>Report ID: #{report.id}</Text>
        </View>

        {/* Animal Information */}
        {report.animal_type && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Animal Information</Text>
            <View style={styles.infoGrid}>
              <InfoItem
                icon="format-list-bulleted"
                label="Type"
                value={report.animal_type}
              />
              {report.pet_breed && (
                <InfoItem icon="dog" label="Breed" value={report.pet_breed} />
              )}
              {report.pet_color && (
                <InfoItem
                  icon="palette"
                  label="Color"
                  value={report.pet_color}
                />
              )}
              {report.pet_gender && (
                <InfoItem
                  icon="gender-male-female"
                  label="Gender"
                  value={report.pet_gender}
                />
              )}
              {report.pet_size && (
                <InfoItem
                  icon="ruler"
                  label="Size"
                  value={report.pet_size}
                />
              )}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incident Description</Text>
          <Text style={styles.descriptionText}>
            {report.description || 'No description provided'}
          </Text>
        </View>

        {/* Location */}
        {report.latitude && report.longitude && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <Text style={styles.addressText}>
              {report.location_address || report.location || 'Location not specified'}
            </Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: parseFloat(report.latitude),
                  longitude: parseFloat(report.longitude),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(report.latitude),
                    longitude: parseFloat(report.longitude),
                  }}
                  pinColor="#FD7E14"
                />
              </MapView>
            </View>
          </View>
        )}

        {/* Patrol Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patrol & Assignment</Text>
          
          {report.assigned_catchers || report.assigned_team ? (
            <View style={styles.assignmentInfo}>
              <View style={styles.assignmentRow}>
                <MaterialCommunityIcons
                  name="account-hard-hat"
                  size={20}
                  color="#FD7E14"
                />
                <Text style={styles.assignmentLabel}>Assigned Catcher(s):</Text>
              </View>
              <Text style={styles.assignmentValue}>
                {report.assigned_catchers || report.assigned_team}
              </Text>

              {report.catcher_contacts && (
                <>
                  <View style={styles.assignmentRow}>
                    <Ionicons name="call" size={18} color="#FD7E14" />
                    <Text style={styles.assignmentLabel}>Contact:</Text>
                  </View>
                  <Text style={styles.assignmentValue}>
                    {report.catcher_contacts}
                  </Text>
                </>
              )}

              {report.patrol_status && (
                <>
                  <View style={styles.assignmentRow}>
                    <MaterialCommunityIcons
                      name="clipboard-check"
                      size={18}
                      color="#FD7E14"
                    />
                    <Text style={styles.assignmentLabel}>Patrol Status:</Text>
                  </View>
                  <Text style={styles.assignmentValue}>{report.patrol_status}</Text>
                </>
              )}

              {(report.patrol_date || report.schedule_date) && (
                <>
                  <View style={styles.assignmentRow}>
                    <Ionicons name="calendar" size={18} color="#FD7E14" />
                    <Text style={styles.assignmentLabel}>Scheduled:</Text>
                  </View>
                  <Text style={styles.assignmentValue}>
                    {report.patrol_date || report.schedule_date}{' '}
                    {report.patrol_time || report.schedule_time || ''}
                  </Text>
                </>
              )}
            </View>
          ) : (
            <Text style={styles.noAssignmentText}>
              No catcher assigned yet. Your report is being reviewed.
            </Text>
          )}
        </View>

        {/* Resolution / Rejection Notes */}
        {report.status === 'Resolved' && report.resolution_notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resolution Notes</Text>
            <Text style={styles.notesText}>{report.resolution_notes}</Text>
          </View>
        )}

        {report.status === 'Rejected' && report.rejection_reason && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rejection Reason</Text>
            <Text style={styles.notesText}>{report.rejection_reason}</Text>
          </View>
        )}

        {/* Images */}
        {report.images && report.images.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Evidence Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {report.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.evidenceImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incident Timeline</Text>
          <View style={styles.timeline}>
            <TimelineItem
              icon="calendar-check"
              label="Incident Date"
              value={formatDateTime(report.incident_date)}
            />
            <TimelineItem
              icon="file-document"
              label="Report Submitted"
              value={formatDateTime(report.created_at || report.reported_at)}
            />
            {report.updated_at &&
              report.updated_at !== report.created_at &&
              report.updated_at !== report.reported_at && (
                <TimelineItem
                  icon="update"
                  label="Last Updated"
                  value={formatDateTime(report.updated_at)}
                />
              )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Helper component for info items
const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <MaterialCommunityIcons name={icon} size={18} color="#FD7E14" />
    <View style={styles.infoItemText}>
      <Text style={styles.infoItemLabel}>{label}:</Text>
      <Text style={styles.infoItemValue}>{value}</Text>
    </View>
  </View>
);

// Helper component for timeline items
const TimelineItem = ({ icon, label, value }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineDot}>
      <MaterialCommunityIcons name={icon} size={16} color="#FD7E14" />
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineLabel}>{label}</Text>
      <Text style={styles.timelineValue}>{value}</Text>
    </View>
  </View>
);

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  statusBannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reportType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reportId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItemText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoItemValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
  assignmentInfo: {
    gap: 12,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  assignmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  assignmentValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 28,
  },
  noAssignmentText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  evidenceImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timelineValue: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
});

export default ReportDetailScreen;
