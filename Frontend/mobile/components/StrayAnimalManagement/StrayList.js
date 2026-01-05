import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const DEFAULT_PET_IMAGE = require("../../assets/icons/logo.png");

const StrayCard = ({ pet, onRedeem }) => {
  const navigation = useNavigation();

  const handleProfilePress = () => {
    navigation.navigate("StrayListProfile", { pet });
  };

  const handleRedeemPress = () => {
    if (pet.status === "Available") {
      navigation.navigate("RedemptionForm", { pet });
    }
  };

  // Determine if redeem button should be disabled
  const isDisabled = pet.status !== "Available";

  return (
    <View style={styles.cardContainer}>
      {/* Main clickable area for profile */}
      <TouchableOpacity
        style={styles.mainContent}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        {/* Image Column */}
        <View style={styles.imageCell}>
          <Image
            source={
              pet.imageUrls && pet.imageUrls.length > 0 && pet.imageUrls[0]
                ? { uri: pet.imageUrls[0] }
                : DEFAULT_PET_IMAGE
            }
            style={styles.petImage}
            resizeMode="cover"
          />
        </View>

        {/* Sex Column */}
        <View style={styles.sexCell}>
          <Ionicons
            name={pet.sex === "Male" ? "male" : "female"}
            size={16}
            color={pet.sex === "Male" ? "#4A90E2" : "#FF6B6B"}
          />
          <Text style={styles.sexText}>{pet.sex || "Unknown"}</Text>
        </View>

        {/* Location Column */}
        <View style={styles.locationCell}>
          <Text style={styles.locationText} numberOfLines={1}>
            {pet.locationCaptured || "Unknown"}
          </Text>
        </View>

        {/* Date Column */}
        <View style={styles.dateCell}>
          <Text style={styles.dateText}>{pet.capturedDate || "N/A"}</Text>
        </View>
      </TouchableOpacity>

      {/* Separate redeem button */}
      <TouchableOpacity
        style={[styles.redeemCell, isDisabled && styles.disabledRedeemCell]}
        onPress={handleRedeemPress}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.redeemButtonText,
            isDisabled && styles.disabledRedeemButtonText,
          ]}
        >
          {isDisabled ? "Unavailable" : "Redeem"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 65,
    backgroundColor: "#FDFDFD",
    borderWidth: 0.2,
    borderColor: "#FDFDFD",
    marginBottom: 10,
    borderRadius: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 8,
    marginHorizontal: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.35,
    shadowRadius: 1,
    elevation: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imageCell: {
    width: 50,
    height: 50,
    borderRadius: 100,
    overflow: "hidden",
    marginRight: 8,
  },
  petImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F1F1F1",
  },
  sexCell: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
  },
  sexText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#666",
  },
  locationCell: {
    flex: 2,
    paddingRight: 8,
    right: 6,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
  dateCell: {
    width: 70,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    right: 2,
  },
  redeemCell: {
    width: 80,
    height: 36,
    backgroundColor: "#FA8630",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledRedeemCell: {
    backgroundColor: "#CCCCCC",
  },
  redeemButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  disabledRedeemButtonText: {
    color: "#666666",
  },
});

export default StrayCard;
