import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import BottomTabNavigator from "../../components/BottomNavigation";

const DEFAULT_PET_IMAGE = require("../../assets/icons/logo.png");

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  
  // Use authenticated user data or fallback to local state
  const [user, setUser] = useState({
    name: authUser?.full_name || "Pet Owner",
    email: authUser?.email || "owner@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  });

  const [pets, setPets] = useState([
    {
      id: "1",
      name: "Buddy",
      breed: "Golden Retriever",
      type: "Dog",
      color: "Black",
      sex: "Male",
      // Correct way to reference the image
      imageUrl: require("../../assets/aspin.jpg"),
    },
    { id: "2", name: "Luna", breed: "Siamese", sex: "Female", imageUrl: null },
    { id: "3", name: "", breed: "Labrador", sex: "Male", imageUrl: null },
    { id: "4", name: "Bella", breed: "", sex: "Female", imageUrl: null },
    { id: "5", name: "Max", breed: "Beagle", sex: "", imageUrl: null },
  ]);

  const [likedPets, setLikedPets] = useState({});

  const handleLike = (petId) => {
    setLikedPets((prev) => ({
      ...prev,
      [petId]: !prev[petId],
    }));
  };

  const handlePress = (pet) => {
    navigation.navigate("PetProfile", {
      petData: {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        color: pet.color,
        breed: pet.breed,
        sex: pet.sex,
        imageUrl: pet.imageUrl || DEFAULT_PET_IMAGE,
        // Add any other pet data you need
      },
    });
  };

  const handleEditProfile = () => {
    // Implement edit profile functionality
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              Alert.alert("Success", "You have been logged out successfully", [
                {
                  text: "OK",
                  onPress: () => navigation.replace("Login")
                }
              ]);
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.profileTitle}></Text>
      <Text style={styles.profileTitle}></Text>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatarImage}
            defaultSource={DEFAULT_PET_IMAGE}
          />
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionHeader}>My Pets</Text>

      <FlatList
        data={pets}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardContainer}
            activeOpacity={0.9}
            onPress={() => handlePress(item)}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={(e) => {
                e.stopPropagation();
                handleLike(item.id);
              }}>
              <Ionicons
                name={likedPets[item.id] ? "heart" : "heart-outline"}
                size={24}
                color={likedPets[item.id] ? "#e0245e" : "#aaa"}
              />
            </TouchableOpacity>

            <Image
              source={
                item.imageUrl ? { uri: item.imageUrl } : DEFAULT_PET_IMAGE
              }
              style={styles.petImage}
              resizeMode="cover"
              defaultSource={DEFAULT_PET_IMAGE}
            />

            <View style={styles.infoContainer}>
              <Text style={[styles.petName, !item.name && styles.unnamedText]}>
                {item.name || "Unnamed"}
              </Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>
                  {item.breed || "Mixed Breed"}
                </Text>
                {item.sex && (
                  <View style={styles.sexContainer}>
                    <Ionicons
                      name={item.sex === "Male" ? "male" : "female"}
                      size={14}
                      color={item.sex === "Male" ? "#4A90E2" : "#FF6B6B"}
                    />
                    <Text style={styles.sexText}>{item.sex}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f43f5e",
    overflow: "hidden",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  petImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
  },
  editButtonText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#ffedd5",
    borderColor: "#fed7aa",
  },
  logoutButtonText: {
    color: "#f97316",
    fontSize: 14,
    fontWeight: "500",
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 15,
  },
  profileTitle: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
  },
  editButtonText: {
    color: "#1f2937",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#ffedd5",
    borderColor: "#fed7aa",
  },
  logoutButtonText: {
    color: "#f97316",
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 12,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  cardContainer: {
    flex: 1,
    margin: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: "48%", // Ensures 2 columns
  },
  likeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 4,
  },
  petImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F1F1F1",
  },
  infoContainer: {
    padding: 12,
  },
  petName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
  },
  unnamedText: {
    color: "#888",
    fontStyle: "italic",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
  },
  sexContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sexText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#666",
  },
  detailsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#FD7E14",
  },
  detailsButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ProfileScreen;
