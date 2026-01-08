/**
 * Enhanced Announcement List Screen with Read/Unread Tracking
 * Features: Search, Filters, Hide, Mark as Read, Unread Badge
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import BackButton from "../../../components/BackButton";
import ScreenHeader from "../../../components/ScreenHeader";
import {
  getUserAnnouncements,
  getUserAnnouncementStats,
  markAnnouncementAsRead,
  hideAnnouncement,
  unhideAnnouncement,
  markAllAnnouncementsAsRead,
} from "../../../services/announcementService";

const EnhancedAnnouncementListScreen = ({ navigation, userId: userIdProp }) => {
  // Allow caller to provide authenticated user id; fall back to 1 to avoid breaking existing flows
  const userId =
    userIdProp ??
    navigation?.getParent?.()?.getState?.()?.userId ??
    navigation?.getState?.()?.userId ??
    1;
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    hidden: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, unread, read, hidden
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch announcements
  const fetchAnnouncements = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const filters = {
        filter: selectedFilter === "all" ? undefined : selectedFilter,
        search: searchQuery || undefined,
      };

      const [data, statsData] = await Promise.all([
        getUserAnnouncements(userId, filters),
        getUserAnnouncementStats(userId),
      ]);

      setAnnouncements(data);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      Alert.alert("Error", "Failed to load announcements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount and when filter/search changes
  useEffect(() => {
    fetchAnnouncements();
  }, [selectedFilter]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements(false);
    }, [selectedFilter, searchQuery])
  );

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements(false);
  };

  // Handle search
  const handleSearch = () => {
    fetchAnnouncements();
  };

  // Handle announcement press
  const handleAnnouncementPress = async (announcement) => {
    // Mark as read before navigating
    if (!announcement.isRead) {
      try {
        await markAnnouncementAsRead(userId, announcement.id);
        // Update local state
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcement.id ? { ...a, isRead: true } : a
          )
        );
        setStats((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1,
        }));
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    navigation.navigate("AnnouncementDetail", { announcement });
  };

  // Handle hide announcement
  const handleHideAnnouncement = (announcement) => {
    Alert.alert(
      "Archive Announcement",
      "Are you sure you want to archive this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await hideAnnouncement(userId, announcement.id);
              // Refetch to apply backend filtering
              await fetchAnnouncements(false);
              Alert.alert("Success", "Announcement archived");
            } catch (error) {
              console.error("Error archiving announcement:", error);
              Alert.alert("Error", "Failed to archive announcement");
            }
          },
        },
      ]
    );
  };

  // Handle unhide announcement
  const handleUnhideAnnouncement = (announcement) => {
    Alert.alert(
      "Unarchive Announcement",
      "Do you want to restore this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unarchive",
          onPress: async () => {
            try {
              await unhideAnnouncement(userId, announcement.id);
              // Refetch to apply backend filtering
              await fetchAnnouncements(false);
              Alert.alert("Success", "Announcement restored");
            } catch (error) {
              console.error("Error unarchiving announcement:", error);
              Alert.alert("Error", "Failed to restore announcement");
            }
          },
        },
      ]
    );
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    Alert.alert("Mark All as Read", "Mark all announcements as read?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark All",
        onPress: async () => {
          try {
            await markAllAnnouncementsAsRead(userId);
            fetchAnnouncements(false);
            Alert.alert("Success", "All announcements marked as read");
          } catch (error) {
            console.error("Error marking all as read:", error);
            Alert.alert("Error", "Failed to mark all as read");
          }
        },
      },
    ]);
  };

  // Render announcement card
  const renderAnnouncementCard = ({ item }) => {
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => handleAnnouncementPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {isUnread && <View style={styles.unreadDot} />}
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(item.category) },
              ]}
            >
              <Text style={styles.categoryText}>
                {item.categoryName || item.category}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() =>
              selectedFilter === "hidden"
                ? handleUnhideAnnouncement(item)
                : handleHideAnnouncement(item)
            }
          >
            <Ionicons
              name={
                selectedFilter === "hidden"
                  ? "arrow-undo-circle-outline"
                  : "close-circle-outline"
              }
              size={20}
              color={selectedFilter === "hidden" ? "#28a745" : "#95a5a6"}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.title, isUnread && styles.titleUnread]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <View style={styles.metaInfo}>
              <Ionicons name="calendar-outline" size={14} color="#7f8c8d" />
              <Text style={styles.metaText}>
                {new Date(item.publishDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaInfo}>
              <Ionicons name="eye-outline" size={14} color="#7f8c8d" />
              <Text style={styles.metaText}>{item.views} views</Text>
            </View>
            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.metaInfo}>
                <Ionicons name="image-outline" size={14} color="#7f8c8d" />
                <Text style={styles.metaText}>{item.attachments.length}</Text>
              </View>
            )}
          </View>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      health: "#dc3545",
      policy: "#0d6efd",
      events: "#28a745",
      general: "#6c757d",
    };
    return colors[category] || colors.general;
  };

  // Filter Modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Announcements</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "all" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setSelectedFilter("all");
              setShowFilterModal(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "all" && styles.filterOptionTextActive,
              ]}
            >
              All Announcements
            </Text>
            <Text style={styles.filterCount}>{stats.total}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "unread" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setSelectedFilter("unread");
              setShowFilterModal(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "unread" && styles.filterOptionTextActive,
              ]}
            >
              Unread
            </Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{stats.unread}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "read" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setSelectedFilter("read");
              setShowFilterModal(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "read" && styles.filterOptionTextActive,
              ]}
            >
              Read
            </Text>
            <Text style={styles.filterCount}>{stats.read}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "hidden" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setSelectedFilter("hidden");
              setShowFilterModal(false);
            }}
          >
            <View style={styles.filterOptionLeft}>
              <Ionicons
                name="archive-outline"
                size={20}
                color={selectedFilter === "hidden" ? "#fff" : "#2c3e50"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.filterOptionText,
                  selectedFilter === "hidden" && styles.filterOptionTextActive,
                ]}
              >
                Archived
              </Text>
            </View>
            <View
              style={[
                styles.filterCountBadge,
                selectedFilter === "hidden" && styles.filterCountBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterCountText,
                  selectedFilter === "hidden" && styles.filterCountTextActive,
                ]}
              >
                {stats.hidden}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <ScreenHeader title="Announcements" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <ScreenHeader title="Announcements" />

      {/* Search and Filter Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                fetchAnnouncements();
              }}
            >
              <Ionicons name="close-circle" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" />
          {stats.unread > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {stats.unread > 99 ? "99+" : stats.unread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {announcements.length} announcement
          {announcements.length !== 1 ? "s" : ""}
        </Text>
        {stats.unread > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Announcements List */}
      <FlatList
        data={announcements}
        renderItem={renderAnnouncementCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#28a745"]}
            tintColor="#28a745"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No announcements found</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === "unread"
                ? "You're all caught up!"
                : selectedFilter === "hidden"
                ? "No hidden announcements"
                : "Check back later for updates"}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7f8c8d",
  },
  searchBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2c3e50",
  },
  filterButton: {
    backgroundColor: "#FD7E14",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#dc3545",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  markAllReadText: {
    fontSize: 13,
    color: "#FD7E14",
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: "#FD7E14",
    backgroundColor: "#fffbf5",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FD7E14",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  moreButton: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
    lineHeight: 24,
  },
  titleUnread: {
    fontWeight: "700",
    color: "#1a252f",
  },
  description: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "column",
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#95a5a6",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7f8c8d",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  filterOptionActive: {
    backgroundColor: "#FD7E14",
  },
  filterOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  filterOptionTextActive: {
    color: "white",
    fontWeight: "600",
  },
  filterCount: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  filterCountBadge: {
    backgroundColor: "#e9ecef",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterCountBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterCountText: {
    color: "#495057",
    fontSize: 12,
    fontWeight: "bold",
  },
  filterCountTextActive: {
    color: "white",
  },
});

export default EnhancedAnnouncementListScreen;

