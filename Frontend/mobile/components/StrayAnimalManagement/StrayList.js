import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { resolveImageUri } from "../../utils/resolveImageUri";

const DEFAULT_PET_IMAGE = require("../../assets/icons/logo.png");

const StrayCard = ({ pet, onRedeem }) => {
  const navigation = useNavigation();

  const mainImageUri = useMemo(
    () => resolveImageUri(pet?.imageUrls?.[0]),
    [pet?.imageUrls]
  );
  const [imageFailed, setImageFailed] = useState(false);

  const handleProfilePress = () => {
    navigation.navigate("StrayListProfile", { pet });
  };

  const handleRedeemPress = () => {
    if (!isDisabled) {
      navigation.navigate("RedemptionForm", { pet });
    }
  };

  // Determine if redeem button should be disabled
  const isDisabled =
    pet.status &&
    pet.status.toLowerCase() !== "captured" &&
    pet.status.toLowerCase() !== "available";

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
              !imageFailed && mainImageUri
                ? { uri: mainImageUri }
                : DEFAULT_PET_IMAGE
            }
            style={styles.petImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        </View>

        {/* Info Column - Display horizontally */}
        <View style={styles.infoCell}>
          <View style={styles.infoRow}>
            {/* Name */}
            <Text style={styles.petName} numberOfLines={1}>
              {pet.name || `Stray #${pet.id}`}
            </Text>

            {/* Gender */}
            <View style={styles.genderRowHorizontal}>
              <Ionicons
                name={pet.sex === "Male" ? "male" : "female"}
                size={12}
                color={pet.sex === "Male" ? "#4A90E2" : "#FF6B6B"}
              />
              <Text style={styles.genderTextHorizontal}>
                {pet.sex || "Unknown"}
              </Text>
            </View>

            {/* RFID */}
            <View style={styles.rfidRowHorizontal}>
              <Text style={styles.rfidTextHorizontal}>
                {pet.rfid || "no rfid"}
              </Text>
            </View>

            {/* Date Captured */}
            <View style={styles.dateRowHorizontal}>
              <Ionicons name="calendar-outline" size={11} color="#888" />
              <Text style={styles.capturedDateTextHorizontal}>
                {pet.capturedDate || "N/A"}
              </Text>
            </View>
          </View>
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
    marginRight: 12,
  },
  petImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F1F1F1",
  },
  infoCell: {
    flex: 1,
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  petName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  genderRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  genderTextHorizontal: {
    fontSize: 11,
    color: "#666",
  },
  rfidRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rfidTextHorizontal: {
    fontSize: 10,
    color: "#666",
    fontFamily: "monospace",
  },
  dateRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  capturedDateTextHorizontal: {
    fontSize: 11,
    color: "#888",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  genderText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#666",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  capturedDateText: {
    fontSize: 11,
    color: "#888",
    marginLeft: 4,
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
