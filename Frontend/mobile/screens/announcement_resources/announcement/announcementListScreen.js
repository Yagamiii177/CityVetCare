import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackButton from "../../../components/BackButton";
import ScreenHeader from "../../../components/ScreenHeader";
import {
  getPublishedAnnouncements,
  categorizeByDate,
  getCategoryColor,
  getPriorityColor,
  getImageUrl,
} from "../../../services/announcementService";

const { width } = Dimensions.get("window");

const AnnouncementListScreen = () => {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [error, setError] = useState(null);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setError(null);
      const data = await getPublishedAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements. Please try again.");
      Alert.alert(
        "Error",
        "Failed to load announcements. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  // Toggle card expansion
  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Navigate to detail screen
  const viewAnnouncementDetail = (announcement) => {
    navigation.navigate("AnnouncementDetail", { announcement });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      health: "medical",
      policy: "document-text",
      events: "calendar",
      general: "information-circle",
    };
    return icons[category] || icons.general;
  };

  // Categorize announcements by date
  const { todayPosts, yesterdayPosts, pastPosts } =
    categorizeByDate(announcements);

  // Render announcement card
  const renderAnnouncementCard = (announcement) => {
    const isExpanded = expandedCards[announcement.id];
    const hasImages =
      announcement.attachments && announcement.attachments.length > 0;
    const firstImage = hasImages ? announcement.attachments[0] : null;

    return (
      <TouchableOpacity
        key={announcement.id}
        style={styles.card}
        onPress={() => viewAnnouncementDetail(announcement)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: getCategoryColor(announcement.category) },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(announcement.category)}
                size={18}
                color="white"
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {announcement.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.authorText}>{announcement.author}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.dateText}>
                  {formatDate(announcement.publishDate)}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(announcement.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{announcement.priority}</Text>
          </View>
        </View>

        {/* Image Preview */}
        {hasImages && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: getImageUrl(firstImage.fileUrl || firstImage.url),
              }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {announcement.attachments.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Ionicons name="images" size={14} color="white" />
                <Text style={styles.imageCountText}>
                  {announcement.attachments.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <Text
          style={styles.description}
          numberOfLines={isExpanded ? undefined : 3}
          ellipsizeMode="tail"
        >
          {announcement.description}
        </Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#7f8c8d" />
              <Text style={styles.statText}>{announcement.views}</Text>
            </View>
            {hasImages && (
              <View style={styles.statItem}>
                <Ionicons name="image-outline" size={16} color="#7f8c8d" />
                <Text style={styles.statText}>
                  {announcement.attachments.length}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#FD7E14" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render section
  const renderSection = (title, posts) => {
    if (posts.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionCount}>{posts.length}</Text>
          </View>
        </View>
        {posts.map((announcement) => renderAnnouncementCard(announcement))}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
        <BackButton />
        <ScreenHeader title="Announcements" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!loading && announcements.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
        <BackButton />
        <ScreenHeader title="Announcements" />
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Ionicons name="megaphone-outline" size={80} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>No Announcements</Text>
          <Text style={styles.emptyText}>
            There are no published announcements at the moment.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAnnouncements}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Main content
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      <BackButton />
      <ScreenHeader title="Announcements" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FD7E14"]}
            tintColor="#FD7E14"
          />
        }
      >
        {/* Header Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{announcements.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{todayPosts.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{yesterdayPosts.length}</Text>
            <Text style={styles.statLabel}>Yesterday</Text>
          </View>
        </View>

        {/* Sections */}
        {renderSection("Today", todayPosts)}
        {renderSection("Yesterday", yesterdayPosts)}
        {renderSection("Past Announcements", pastPosts)}

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FD7E14",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FD7E14",
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  sectionBadge: {
    backgroundColor: "#FD7E14",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  dotSeparator: {
    fontSize: 12,
    color: "#bdc3c7",
  },
  dateText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },
  imageCountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  imageCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewButtonText: {
    color: "#FD7E14",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AnnouncementListScreen;
