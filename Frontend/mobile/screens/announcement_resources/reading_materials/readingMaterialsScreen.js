import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../../components/ScreenHeader";
import {
  getPublishedReadingMaterials,
  getMaterialTypeIcon,
  getMaterialTypeLabel,
  formatDate,
  getReadingTime,
  searchMaterials,
  filterByType,
  getImageUrl,
} from "../../../services/readingMaterialService";

const { width } = Dimensions.get("window");

const ReadingMaterialsScreen = () => {
  const navigation = useNavigation();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [materials, searchQuery, selectedType]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublishedReadingMaterials();
      setMaterials(data);
    } catch (err) {
      setError("Failed to load reading materials. Please try again.");
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMaterials();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = materials;

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filterByType(filtered, selectedType);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = searchMaterials(filtered, searchQuery);
    }

    setFilteredMaterials(filtered);
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLinkPress = (url) => {
    if (!url) return;

    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
    });
  };

  const handleViewDetails = (material) => {
    navigation.navigate("ReadingMaterialDetail", { material });
  };

  const renderTypeFilter = () => {
    const types = [
      { value: "all", label: "All" },
      { value: "book", label: "Books" },
      { value: "website", label: "Websites" },
      { value: "digital", label: "Digital" },
      { value: "article", label: "Articles" },
    ];

    return (
      <View style={styles.filterContainer}>
        {types.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterButton,
              selectedType === type.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === type.value && styles.filterButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMaterialCard = (material) => {
    const coverImage =
      material.images?.find((img) => img.isCover) || material.images?.[0];
    const readingTime = getReadingTime(material.content);

    return (
      <TouchableOpacity
        key={material.id}
        style={styles.materialCard}
        onPress={() => handleViewDetails(material)}
        activeOpacity={0.7}
      >
        {/* Material Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {getMaterialTypeIcon(material.type)}{" "}
            {getMaterialTypeLabel(material.type)}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.materialTitle}>{material.title}</Text>

        {/* Author & Date */}
        {(material.author || material.date_added) && (
          <View style={styles.metaInfo}>
            {material.author && (
              <Text style={styles.metaText}>By {material.author}</Text>
            )}
            {material.date_added && (
              <Text style={styles.metaText}>
                {formatDate(material.date_added)}
              </Text>
            )}
          </View>
        )}

        {/* Cover Image */}
        {coverImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(coverImage.url) }}
              style={styles.materialImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Description */}
        {material.description && (
          <Text
            style={styles.materialDescription}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {material.description}
          </Text>
        )}

        {/* Reading Time */}
        {readingTime > 0 && (
          <Text style={styles.readingTime}>📖 {readingTime} min</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📚</Text>
      <Text style={styles.emptyStateTitle}>No Reading Materials Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? `No materials match "${searchQuery}"`
          : "Check back later for new materials"}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchMaterials}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenHeader title="Reading Materials" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      </View>
    );
  }

  if (error && materials.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenHeader title="Reading Materials" />
        {renderError()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Reading Materials" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Type Filters */}
        {renderTypeFilter()}

        {/* Materials Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredMaterials.length}{" "}
            {filteredMaterials.length === 1 ? "material" : "materials"} found
          </Text>
        </View>

        {/* Materials List */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FD7E14"]}
            />
          }
        >
          {filteredMaterials.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredMaterials.map(renderMaterialCard)}
            </View>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </View>
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
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    fontSize: 20,
    color: "#999",
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 0,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#FD7E14",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#FD7E14",
    borderColor: "#FD7E14",
  },
  filterButtonText: {
    fontSize: 13,
    color: "#FD7E14",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
  scrollContainer: {
    padding: 8,
    paddingTop: 0,
    paddingBottom: 80,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    gap: 5,
  },
  materialCard: {
    width: (width - 40) / 2, // Changed from 32 to 40 (adds more space)
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    color: "#F57C00",
    fontWeight: "600",
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 6,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#95a5a6",
  },
  imageContainer: {
    height: 120,
    width: "100%",
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
  },
  materialImage: {
    width: "100%",
    height: "100%",
  },
  materialDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    fontWeight: "400",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#ecf0f1",
    marginVertical: 8,
  },
  materialContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginBottom: 8,
  },
  readingTime: {
    fontSize: 11,
    color: "#95a5a6",
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: "#34495e",
  },
  linkButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  linkButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  expandButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  expandButtonText: {
    color: "#FD7E14",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FD7E14",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReadingMaterialsScreen;
