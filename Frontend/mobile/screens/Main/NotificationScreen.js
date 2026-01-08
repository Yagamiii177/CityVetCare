import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
} from "react-native";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import BottomTabNavigator from "../../components/BottomNavigation";
import ScreenHeader from "../../components/ScreenHeader";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailNotification, setDetailNotification] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const filterOptions = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "read", label: "Read" },
    { id: "pet_capture", label: "Capture Alerts" },
  ];

  // Fetch notifications from backend using notifications API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getAll();
      const notificationList = data?.notifications || [];

      const transformedNotifications = notificationList.map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        description: notif.message,
        icon: getIconForType(notif.type),
        screen: getScreenForType(notif.type),
        category: notif.type,
        read: Boolean(notif.is_read ?? notif.read ?? false),
        date: notif.created_at
          ? new Date(notif.created_at).toLocaleDateString()
          : new Date().toLocaleDateString(),
        pet: notif.stray_animal || null, // Include the stray animal data
        incident_id: notif.incident_id || null, // Include incident ID for navigation
        incident_status: notif.incident_status || null,
        incident_type: notif.incident_type || null,
      }));

      setNotifications(transformedNotifications);
      await fetchUnread();
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnread = async () => {
    try {
      const data = await api.notifications.getUnreadCount();
      setUnreadCount(data?.unread ?? 0);
    } catch (e) {
      setUnreadCount(0);
    }
  };

  const markAllRead = async () => {
    try {
      setMarkingAll(true);
      await api.notifications.markAllRead();
      await fetchNotifications();
    } catch (e) {
      // no-op
    } finally {
      setMarkingAll(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "pet_capture":
        return require("../../assets/icons/adopt_pet_icon.png");
      case "adoption_status":
        return require("../../assets/icons/adopt_pet_icon.png");
      case "submission":
      case "status_update":
      case "rejection":
      case "new_report":
      case "report_status":
        return require("../../assets/icons/report_icon.png");
      default:
        return require("../../assets/icons/logo.png");
    }
  };

  const getScreenForType = (type) => {
    switch (type) {
      case "pet_capture":
        return "Notifications";
      case "submission":
      case "status_update":
      case "rejection":
      case "new_report":
      case "report_status":
        return "MyReports";
      default:
        return "Notifications";
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnread();

    // Set up polling for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Handle notification press based on type/screen
  const openDetail = async (notification) => {
    if (notification?.id) {
      try {
        await api.notifications.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        fetchUnread();
      } catch {}
    }

    // If it's an incident notification, navigate to My Reports with the incident
    if (notification.incident_id && 
        (notification.type === 'submission' || 
         notification.type === 'status_update' || 
         notification.type === 'rejection')) {
      // Close any open modals first
      setDetailModalVisible(false);
      setDetailNotification(null);
      
      // Navigate to My Reports screen (which will show the incident)
      navigation.navigate('MyReports', {
        highlightIncidentId: notification.incident_id
      });
      return;
    }

    // Otherwise show the detail modal
    setDetailNotification(notification);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setDetailNotification(null);
  };

  const deleteNotification = async (id) => {
    try {
      await api.notifications.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchUnread();
    } catch {}
  };

  // Filter notifications based on search query and selected filters
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    let matchesActive = true;
    if (activeFilter === "unread") matchesActive = !notif.read;
    else if (activeFilter === "read") matchesActive = !!notif.read;
    else if (activeFilter === "pet_capture")
      matchesActive = notif.type === "pet_capture";
    return matchesSearch && matchesActive;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" showBackButton={false} />
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#4B5563" }}>
          Unread:{" "}
          <Text style={{ fontWeight: "700", color: "#111827" }}>
            {unreadCount}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={markAllRead}
          disabled={markingAll || unreadCount === 0}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor:
              markingAll || unreadCount === 0 ? "#E5E7EB" : "#2563EB",
          }}
        >
          <Text
            style={{
              color: markingAll || unreadCount === 0 ? "#6B7280" : "#fff",
              fontWeight: "600",
            }}
          >
            {markingAll ? "Marking…" : "Mark all as read"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterRowScroll}
      >
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => setActiveFilter(opt.id)}
            style={[
              styles.chip,
              activeFilter === opt.id ? styles.chipActive : null,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === opt.id ? styles.chipTextActive : null,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Recent Notifications</Text>

        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <Swipeable
              key={notif.id}
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => deleteNotification(notif.id)}
                >
                  <Ionicons name="trash" size={24} color="#fff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            >
              <TouchableOpacity
                style={[
                  styles.notificationCard,
                  !notif.read ? styles.unreadCard : null,
                ]}
                onPress={() => openDetail(notif)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  <Image source={notif.icon} style={styles.notificationIcon} />
                  <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationText}>{notif.title}</Text>
                    {notif.description ? (
                      <Text
                        style={styles.notificationDescription}
                        numberOfLines={2}
                      >
                        {notif.description}
                      </Text>
                    ) : null}
                    <Text style={styles.notificationDate}>{notif.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={42} color="#bbb" />
            <Text style={styles.noResultsTitle}>No notifications</Text>
            <Text style={styles.noResultsText}>
              You're all caught up for now.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={detailModalVisible}
        onRequestClose={closeDetail}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>
                {detailNotification?.title}
              </Text>
              {detailNotification?.type ? (
                <Text style={styles.detailType}>
                  Type: {detailNotification.type}
                </Text>
              ) : null}
              {detailNotification?.description ? (
                <Text style={styles.detailDescription}>
                  {detailNotification.description}
                </Text>
              ) : null}
              <Text style={styles.detailDate}>
                Date: {detailNotification?.date}
              </Text>
              <View style={styles.detailButtons}>
                {detailNotification?.incident_id && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      closeDetail();
                      navigation.navigate('MyReports', {
                        highlightIncidentId: detailNotification.incident_id
                      });
                    }}
                  >
                    <Ionicons name="document-text" size={18} color="#fff" />
                    <Text style={styles.primaryButtonText}>View Report</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    deleteNotification(detailNotification.id);
                    closeDetail();
                  }}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeDetail}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>

      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F1F1" },
  scrollContainer: { padding: 20, paddingBottom: 100, flexGrow: 1 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 45,
  },
  filterRowScroll: { maxHeight: 52 },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: "center",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: "100%", fontSize: 16 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FA8630",
    marginRight: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#FA8630",
    borderColor: "#FA8630",
  },
  chipText: { color: "#FA8630", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },
  notificationContent: { flexDirection: "row", alignItems: "center" },
  notificationIcon: { width: 40, height: 40, marginRight: 14 },
  notificationTextContainer: { flex: 1 },
  notificationText: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 20,
    fontWeight: "600",
  },
  notificationDescription: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  notificationDate: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteText: { color: "#fff", marginTop: 4, fontSize: 12, fontWeight: "600" },
  noResultsText: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 14,
    color: "#9CA3AF",
  },
  noResultsTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptyState: { marginTop: 40, alignItems: "center", justifyContent: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  detailContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  detailType: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  detailDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
  },
  detailDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  detailButtons: {
    marginTop: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    marginBottom: 10,
  },
  primaryButtonText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    marginBottom: 10,
  },
  deleteButtonText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  closeButtonText: { color: "#111827", fontWeight: "700" },
});

export default NotificationScreen;
