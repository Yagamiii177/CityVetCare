import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";
import AdoptionCard from "../../components/StrayAnimalManagement/AdoptionCard";
import SearchBar from "../../components/StrayAnimalManagement/SearchBar";

const AdoptionScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPets, setLikedPets] = useState({});
  const [filter, setFilter] = useState(null);

  const pets = [
    {
      id: "1",
      name: "Max",
      breed: "Aspen",
      sex: "Male",
      age: "2 years",
      type: "dog",
      color: "Brown",
      markings: "White patch",
      capturedDate: "2025-05-01",
      capturedLocation: "Naga City Park",
      notes: "Very friendly and active.",
      imageUrls: [
        "https://static.vecteezy.com/system/resources/previews/008/951/892/non_2x/cute-puppy-pomeranian-mixed-breed-pekingese-dog-run-on-the-grass-with-happiness-photo.jpg",
        "https://images.unsplash.com/photo-1611003228941-98852ba62227?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8",
        "https://st3.depositphotos.com/14405618/37314/i/450/depositphotos_373148048-stock-photo-cute-puppies-pomeranian-mixed-breed.jpg",
      ],
    },
    {
      id: "2",
      name: "Josh",
      breed: "Siamese",
      sex: "Female",
      age: "5 years",
      type: "cat",
      color: "Brown",
      markings: "White patch",
      capturedDate: "2025-05-01",
      capturedLocation: "Naga City Park",
      notes: "Very friendly and active.",
      imageUrls: [
        "https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      ],
    },
    {
      id: "3",
      name: "Shady",
      breed: "Askal",
      sex: "Male",
      age: "7 years",
      type: "dog",
      color: "Brown",
      markings: "White patch",
      capturedDate: "2025-05-01",
      capturedLocation: "Naga City Park",
      notes: "Very friendly and active.",
      imageUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Labrador_Retriever_portrait.jpg/1200px-Labrador_Retriever_portrait.jpg",
      ],
    },
  ];

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
      <ScreenHeader title="Pet Adoption" />

      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onFilter={handleFilter}
          activeFilter={filter}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.petsContainer}>
          {filteredPets.map((pet) => (
            <AdoptionCard
              key={pet.id}
              pet={pet}
              liked={!!likedPets[pet.id]}
              onLike={() => toggleLike(pet.id)}
              onPress={() => navigation.navigate("AnimalProfile", { pet })}
            />
          ))}
        </View>
      </ScrollView>
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
});

export default AdoptionScreen;
