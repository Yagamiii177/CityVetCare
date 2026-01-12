import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Share,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../../components/ScreenHeader";
import {
  getMaterialTypeIcon,
  getMaterialTypeLabel,
  formatDate,
  getReadingTime,
  getImageUrl,
} from "../../../services/readingMaterialService";

const { width } = Dimensions.get("window");

const ReadingMaterialDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { material } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const readingTime = getReadingTime(material.content);
  const images = material.images || [];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${material.title}\n\n${
          material.description || ""
        }\n\nRead more on CityVetCare app`,
        title: material.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleLinkPress = () => {
    if (!material.url) return;

    Linking.openURL(material.url).catch((err) => {
      console.error("Failed to open URL:", err);
    });
  };

  const renderImageGallery = () => {
    if (images.length === 0) return null;

    return (
      <View style={styles.galleryContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentImageIndex(slideIndex);
          }}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageSlide}>
              <Image
                source={{ uri: getImageUrl(image.url) }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Material Details" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {getMaterialTypeIcon(material.type)}{" "}
            {getMaterialTypeLabel(material.type)}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{material.title}</Text>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          {material.author && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>✍️</Text>
              <Text style={styles.metaText}>{material.author}</Text>
            </View>
          )}

          {material.date_added && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>
                {formatDate(material.date_added)}
              </Text>
            </View>
          )}

          {readingTime > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📖</Text>
              <Text style={styles.metaText}>{readingTime} min read</Text>
            </View>
          )}
        </View>

        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Description */}
        {material.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{material.description}</Text>
          </View>
        )}

        {/* Content */}
        {material.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Text style={styles.content}>{material.content}</Text>
          </View>
        )}

        {/* Category */}
        {material.category && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{material.category}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {material.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* External Link */}
        {material.url && (
          <TouchableOpacity style={styles.linkButton} onPress={handleLinkPress}>
            <Text style={styles.linkButtonText}>
              🔗 Visit{" "}
              {material.type === "website" ? "Website" : "External Resource"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Views Count */}
        {material.views !== undefined && (
          <View style={styles.viewsContainer}>
            <Text style={styles.viewsText}>
              👁️ {material.views} {material.views === 1 ? "view" : "views"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  typeBadgeText: {
    fontSize: 14,
    color: "#F57C00",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  galleryContainer: {
    marginBottom: 20,
  },
  imageSlide: {
    width: width,
    height: 250,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#bdc3c7",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#FD7E14",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
    fontWeight: "500",
  },
  content: {
    fontSize: 15,
    lineHeight: 26,
    color: "#555",
    textAlign: "justify",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#34495e",
    fontWeight: "500",
  },
  linkButton: {
    backgroundColor: "#FD7E14",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  linkButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewsContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  viewsText: {
    fontSize: 13,
    color: "#95a5a6",
  },
});

export default ReadingMaterialDetailScreen;
