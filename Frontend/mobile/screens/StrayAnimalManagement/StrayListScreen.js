import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import BottomTabNavigator from "../../components/BottomNavigation";
import StrayCard from "../../components/StrayAnimalManagement/StrayList";
import StrayFilterBar from "../../components/StrayAnimalManagement/StrayListFilter";
import api from "../../services/api";

const isWithinDateRange = (dateString, range) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  const diffTime = today - date;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  switch (range) {
    case "today":
      return diffDays === 0;
    case "week":
      return diffDays <= 7;
    case "month":
      return diffDays <= 30;
    default:
      return true;
  }
};

const StrayListScreen = () => {
  const [strayAnimals, setStrayAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);

  useEffect(() => {
    const loadCaptured = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.strayAnimals.list({ status: "captured" });
        const animals = response?.data?.data || response?.data || [];
        const normalizeImages = (images) => {
          if (!images) return [];
          if (Array.isArray(images)) return images.filter(Boolean);
          if (typeof images === "string") {
            try {
              const parsed = JSON.parse(images);
              if (Array.isArray(parsed)) return parsed.filter(Boolean);
              if (parsed && typeof parsed === "object")
                return Object.values(parsed).filter(Boolean);
            } catch (e) {
              return [];
            }
          }
          if (typeof images === "object") {
            return Object.values(images).filter(Boolean);
          }
          return [];
        };
        const mapped = animals.map((animal) => ({
          id: animal.id?.toString() || animal.animal_id?.toString(),
          name: animal.name || `Stray #${animal.id}`,
          breed: animal.breed || "Mixed Breed",
          sex: (animal.sex || animal.gender || "Unknown").toString(),
          color: animal.color || "",
          markings: animal.markings || "",
          locationCaptured:
            animal.locationCaptured || animal.location_captured || "",
          imageUrls: normalizeImages(animal.images),
          capturedDate: animal.dateCaptured || animal.date_captured,
          status: (animal.status || "captured").toString(),
          type: animal.species?.toLowerCase() || "dog",
          rfid: animal.rfid || null,
        }));
        setStrayAnimals(mapped);
      } catch (e) {
        setError("Failed to load captured animals");
        setStrayAnimals([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCaptured();
  }, []);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleFilter = (type) => {
    setActiveFilter(activeFilter === type ? null : type);
  };

  const handleDateFilter = (dateRange) => {
    setDateFilter(dateRange);
  };

  const filteredAnimals = strayAnimals.filter((animal) => {
    if ((animal.status || "").toLowerCase() !== "captured") return false;

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesFilter =
      !activeFilter ||
      (activeFilter === "cat" && animal.type === "cat") ||
      (activeFilter === "dog" && animal.type === "dog") ||
      activeFilter === "nearby";

    // Date filter
    const matchesDate =
      !dateFilter || isWithinDateRange(animal.capturedDate, dateFilter);

    return matchesSearch && matchesFilter && matchesDate;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recently Captured Animals</Text>
        <View style={styles.orangeDivider} />
      </View>

      <View style={styles.searchContainer}>
        <StrayFilterBar
          onFilter={handleFilter}
          activeFilter={activeFilter}
          onDateFilter={handleDateFilter}
        />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingTop: 5 }}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FA8630" />
            <Text style={styles.loadingText}>Loading captured animals...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredAnimals.length > 0 ? (
          filteredAnimals.map((animal) => (
            <StrayCard key={animal.id} pet={animal} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No available stray animals found
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F1",
  },
  header: {
    padding: 16,
    backgroundColor: "#F1F1F1",
    marginTop: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  orangeDivider: {
    height: 2.5,
    width: "100%",
    backgroundColor: "#FA8630",
    borderRadius: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#F1F1F1",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  loadingText: { marginTop: 8, color: "#666" },
  errorText: { color: "#D32F2F" },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});

export default StrayListScreen;
