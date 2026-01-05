import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import BottomTabNavigator from "../../components/BottomNavigation";
import StrayCard from "../../components/StrayAnimalManagement/StrayList";
import StrayFilterBar from "../../components/StrayAnimalManagement/StrayListFilter";

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
  const [strayAnimals, setStrayAnimals] = useState([
    {
      id: "1",
      name: "Alex",
      breed: "Aspin",
      sex: "Male",
      color: "Brown",
      markings: "White patch",
      locationCaptured: "Pasig asdas",
      imageUrls: [
        "https://i.pinimg.com/736x/fd/a2/1d/fda21db0ec5eb0a84f36b095dff65cf7.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQFebt5Q99HCSDJ26gpu1XEiMa15WdVcMv2j3dq1017_qBQfKqd5NxjTT9-UFHJhhn_yM&usqp=CAU",
      ],
      capturedDate: "2025-06-01",
      status: "Available",
      type: "dog",
    },
    {
      id: "2",
      name: "Steve",
      breed: "Labrador",
      sex: "Female",
      color: "Brown",
      markings: "White patch",
      locationCaptured: "Quezon",
      imageUrls: [
        "https://images.aeonmedia.co/images/acd6897d-9849-4188-92c6-79dabcbcd518/essay-final-gettyimages-685469924.jpg?width=3840&quality=75&format=auto",
      ],
      capturedDate: "2025-05-12",
      status: "Available",
      type: "dog",
    },
    {
      id: "3",
      name: "Ram",
      breed: "Aspin",
      sex: "Male",
      color: "Brown",
      markings: "White patch",
      locationCaptured: "Naga",
      imageUrls: [
        "https://a.storyblok.com/f/152976/4868x3244/a92f98e7cc/frame-8.png",
      ],
      capturedDate: "2025-05-01",
      status: "Available",
      type: "cat",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);

  const handleRedeem = (id) => {
    Alert.alert(
      "Confirm Redemption",
      "Are you sure you want to redeem this animal?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            setStrayAnimals((prevAnimals) =>
              prevAnimals.map((animal) =>
                animal.id === id ? { ...animal, status: "Redeemed" } : animal
              )
            );
          },
        },
      ]
    );
  };

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
    if (animal.status !== "Available") return false;

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
        {filteredAnimals.length > 0 ? (
          filteredAnimals.map((animal) => (
            <StrayCard
              key={animal.id}
              pet={animal}
              onRedeem={() => handleRedeem(animal.id)}
            />
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
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});

export default StrayListScreen;
