import React from "react";
import BackButton from "../../components/BackButton";
import ScreenHeader from "../../components/ScreenHeader";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const EventsScreen = () => {
  const navigation = useNavigation();

  const handleRegisterPress = (eventType) => {
    navigation.navigate("EventRegistration", { eventType });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Events" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Vaccination Event Card */}
          <View style={styles.eventCard}>
            <Text style={styles.sectionTitle}>Vaccination Drive Event!</Text>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/CampaignManagement/image7.png")}
                style={styles.eventImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.eventDescription}>
              The House-to-House Rabies Vaccination is currently ongoing in
              Barangay Cararayan, Naga City. Despite the extreme heat, our
              personnel and Barangay Health Workers (BHW) remain dedicated to
              delivering this service to you. We encourage everyone to cooperate
              and have your pets vaccinated.
            </Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => handleRegisterPress("vaccination")}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Castration Event Card */}
          <View style={styles.eventCard}>
            <Text style={styles.sectionTitle}>Castration Drive Event!</Text>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/CampaignManagement/image9.png")}
                style={styles.eventImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.eventDescription}>
              In celebration of Rabies Awareness Month, we invite all pet owners
              of City of Naga and Metro Naga to join us for an anti-rabies
              vaccination and castration campaign. Let's work together to
              protect our pets, families, and community from rabies!
            </Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => handleRegisterPress("castration")}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  eventCard: {
    width: width - 32,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    height: 200, // Fixed height for the image container
    width: "100%",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f8f8", // Background color for empty space if image has transparency
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
    width: "100%",
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#FD7E14",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EventsScreen;
