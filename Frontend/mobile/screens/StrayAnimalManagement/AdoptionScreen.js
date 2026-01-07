import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import ScreenHeader from "../../components/ScreenHeader";
import AdoptionCard from "../../components/StrayAnimalManagement/AdoptionCard";
import SearchBar from "../../components/StrayAnimalManagement/SearchBar";
import api from "../../services/api";

const AdoptionScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPets, setLikedPets] = useState({});
  const [filter, setFilter] = useState(null);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdoptionAnimals();
  }, []);

  const loadAdoptionAnimals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.strayAnimals.listAdoption();
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

      // Keep only animals marked for adoption
      const adoptionOnly = animals.filter((animal) => {
        const statusValue = (
          animal.status ||
          animal.animal_status ||
          animal.adoption_status ||
          ""
        )
          .toString()
          .toLowerCase();

        return statusValue === "adoption";
      });

      // Map backend data to mobile format
      const mappedAnimals = adoptionOnly.map((animal) => ({
        id: animal.id?.toString() || animal.animal_id?.toString(),
        name: animal.name || `Stray #${animal.id}`,
        breed: animal.breed || "Mixed Breed",
        sex: animal.sex || animal.gender || "Unknown",
        age: "Unknown", // Backend doesn't have age field
        type: animal.species?.toLowerCase() || "dog",
        status:
          (
            animal.status ||
            animal.animal_status ||
            animal.adoption_status ||
            ""
          )
            .toString()
            .toLowerCase() || "unknown",
        color: animal.color || "",
        markings: animal.markings || "",
        capturedDate: animal.dateCaptured || animal.date_captured,
        capturedLocation:
          animal.locationCaptured || animal.location_captured || "",
        notes: "",
        imageUrls: normalizeImages(animal.images),
        rfid: animal.rfid || null,
      }));

      setPets(mappedAnimals);
    } catch (error) {
      console.error("Failed to load adoption animals:", error);
      setError("Failed to load adoption animals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (id) => {
    setLikedPets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFilter = (type) => {
    setFilter((prev) => (prev === type ? null : type)); // Toggle filter
  };

  const filteredPets = pets.filter((pet) => {
    const petName = pet.name && pet.name.trim() !== "" ? pet.name : "Unnamed";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      petName.toLowerCase().includes(query) ||
      pet.breed.toLowerCase().includes(query);

    const matchesFilter =
      !filter ||
      (filter === "favorites" && likedPets[pet.id]) ||
      (filter === "dog" && pet.type === "dog") ||
      (filter === "cat" && pet.type === "cat");

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pet Adoption" showBackButton />

      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onFilter={handleFilter}
          activeFilter={filter}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FA8630" />
          <Text style={styles.loadingText}>Loading animals...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.petsContainer}>
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <AdoptionCard
                  key={pet.id}
                  pet={pet}
                  liked={!!likedPets[pet.id]}
                  onLike={() => toggleLike(pet.id)}
                  onPress={() => navigation.navigate("AnimalProfile", { pet })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery || filter
                    ? "No animals match your search"
                    : "No animals available for adoption"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F1F1" },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#F1F1F1",
    zIndex: 1,
  },
  contentContainer: { padding: 16, paddingBottom: 30 },
  petsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});

export default AdoptionScreen;
