import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { resolveImageUri } from "../../utils/resolveImageUri";

const DEFAULT_PET_IMAGE = require("../../assets/icons/logo.png");

const AdoptionCard = ({ pet, onPress, liked, onLike }) => {
  const navigation = useNavigation();

  const [imageFailed, setImageFailed] = useState(false);
  const mainImageUri = useMemo(
    () => resolveImageUri(pet?.imageUrls?.[0]),
    [pet?.imageUrls]
  );

  const handleAdoptPress = () => {
    navigation.navigate("AdoptionForm", { pet });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Like Button */}
      <TouchableOpacity style={styles.likeButton} onPress={onLike}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={24}
          color={liked ? "#e0245e" : "#aaa"}
        />
      </TouchableOpacity>

      {/* Pet Image */}
      <Image
        source={
          !imageFailed && mainImageUri
            ? { uri: mainImageUri }
            : DEFAULT_PET_IMAGE
        }
        style={styles.petImage}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />

      {/* Pet Info */}
      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.petName,
            (!pet.name || pet.name.trim() === "") && styles.unnamedText,
          ]}
        >
          {pet.name && pet.name.trim() !== "" ? pet.name : "Unnamed"}
        </Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{pet.breed || "Mixed Breed"}</Text>
          <View style={styles.sexContainer}>
            <Ionicons
              name={pet.sex === "Male" ? "male" : "female"}
              size={14}
              color={pet.sex === "Male" ? "#4A90E2" : "#FF6B6B"}
            />
            <Text style={styles.sexText}>{pet.sex || "Unknown"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={handleAdoptPress}
        >
          <Text style={styles.detailsButtonText}>Adopt</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 8,
    borderWidth: 0.2,
    borderColor: "grey",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 5,
  },
  likeButton: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 4,
  },
  petImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#F1F1F1",
  },
  infoContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  petName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 7,
  },
  unnamedText: {
    color: "#888",
    fontStyle: "italic",
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#666666",
  },
  sexContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sexText: {
    fontSize: 12,
    marginLeft: 2,
    color: "#666666",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    borderRadius: 6,
    backgroundColor: "#FA8630",
  },
  detailsButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    left: 43,
  },
});

export default AdoptionCard;
