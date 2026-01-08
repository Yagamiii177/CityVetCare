import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../../components/BackButton";
import ScreenHeader from "../../../components/ScreenHeader";
import { getAnnouncementById } from "../../../services/announcementService";
import { API_CONFIG } from "../../../config/api-config";

const { width } = Dimensions.get("window");

const AnnouncementDetailScreen = ({ route }) => {
  const { announcement: initialAnnouncement } = route.params;
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Fetch announcement details to increment view count
  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      try {
        const details = await getAnnouncementById(initialAnnouncement.id);
        setAnnouncement(details);
      } catch (error) {
        console.error("Error fetching announcement details:", error);
        // Keep using initial announcement if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncementDetails();
  }, [initialAnnouncement.id]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      health: "#dc3545",
      policy: "#0d6efd",
      events: "#28a745",
      general: "#6c757d",
    };
    return colors[category] || colors.general;
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    const colors = {
      High: "#dc3545",
      Medium: "#ffc107",
      Low: "#28a745",
    };
    return colors[priority] || colors.Medium;
  };

  // Handle image scroll
  const handleScroll = (event) => {
    const slideSize = width - 32;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  // Scroll to specific image
  const scrollToImage = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (width - 32) * index,
        animated: true,
      });
    }
    setCurrentImageIndex(index);
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    // Construct full URL from backend using API config
    const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
    const fullUrl = `${baseUrl}${imagePath}`;
    console.log("Image URL:", fullUrl);
    return fullUrl;
  };

  const images = announcement.attachments || [];
  const hasImages = images.length > 0;

  // Show loading state while fetching
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
        <BackButton />
        <ScreenHeader title="Announcement Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading announcement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      <BackButton />
      <ScreenHeader title="Announcement Details" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(announcement.category) },
              ]}
            >
              <Text style={styles.badgeText}>
                {announcement.categoryName || announcement.category}
              </Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(announcement.priority) },
              ]}
            >
              <Text style={styles.badgeText}>{announcement.priority}</Text>
            </View>
          </View>

          <Text style={styles.title}>{announcement.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>{announcement.author}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>
                {formatDate(announcement.publishDate)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>{announcement.views} views</Text>
            </View>
          </View>
        </View>

        {/* Image Carousel */}
        {hasImages && (
          <View style={styles.imageCarouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.imageScroll}
            >
              {images.map((image, index) => (
                <View key={index} style={styles.imageSlide}>
                  <Image
                    source={{ uri: getImageUrl(image.fileUrl || image.url) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Image Indicators */}
            {images.length > 1 && (
              <View style={styles.indicatorContainer}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => scrollToImage(index)}
                    style={[
                      styles.indicator,
                      currentImageIndex === index && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{announcement.description}</Text>

          {announcement.content &&
            announcement.content !== announcement.description && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Full Content</Text>
                <Text style={styles.content}>{announcement.content}</Text>
              </>
            )}
        </View>

        {/* Additional Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{announcement.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Audience:</Text>
            <Text style={styles.infoValue}>
              {announcement.audience || "Public"}
            </Text>
          </View>
          {announcement.lastUpdated && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>
                {formatDate(announcement.lastUpdated)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7f8c8d",
  },
  headerCard: {
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
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  imageCarouselContainer: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  imageScroll: {
    height: 250,
  },
  imageSlide: {
    width: width - 32,
    height: 250,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  indicatorActive: {
    backgroundColor: "#FD7E14",
    width: 24,
  },
  imageCounter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  contentCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
  },
  infoCard: {
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    textTransform: "capitalize",
  },
});

export default AnnouncementDetailScreen;

