import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomTabNavigator from "../../components/BottomNavigation";
const PetProfile = ({ route }) => {
  const navigation = useNavigation();
  const { petData } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.profileTitle}></Text>
      <Text style={styles.profileTitle}></Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back-outline" size={24} color="black" />
      </TouchableOpacity>
      <Image
        source={petData.imageUrl}
        style={styles.petImage}
        resizeMode="cover"
      />
      <Text style={styles.petName}>{petData.name}</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Type:</Text>
        <Text style={styles.detailValue}>{petData.type}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Breed:</Text>
        <Text style={styles.detailValue}>{petData.breed}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Sex:</Text>
        <Text style={styles.detailValue}>
          <Ionicons
            name={petData.sex === "Male" ? "male" : "female"}
            size={16}
            color={petData.sex === "Male" ? "#4A90E2" : "#FF6B6B"}
          />{" "}
          {petData.sex.charAt(0).toUpperCase() + petData.sex.slice(1)}
          {petData.isCastrated && " (Neutered/Spayed)"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Color:</Text>
        <Text style={styles.detailValue}>{petData.color}</Text>
      </View>

      {petData.markings && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Markings:</Text>
          <Text style={styles.detailValue}>{petData.markings}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
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
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
});

export default PetProfile;
