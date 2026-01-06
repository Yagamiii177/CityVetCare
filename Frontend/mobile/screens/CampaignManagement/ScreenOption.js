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

const ScreenOption = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Select Option" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Events Card */}
          <View style={styles.eventCard}>
            <Text style={styles.sectionTitle}>Events</Text>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/CampaignManagement/calendar1.png")}
                style={styles.eventImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.eventDescription}>
              Join us this Rabies Awareness Month for special community events
              in the City of Naga and Metro Naga!
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => navigation.navigate("EventsScreen")}
            >
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
          </View>

          {/* Reading Material Card */}
          <View style={styles.eventCard}>
            <Text style={styles.sectionTitle}>Reading Material</Text>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/CampaignManagement/book1.png")}
                style={styles.eventImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.eventDescription}>
              Stay informed and empowered! Explore helpful guides, tips, and
              information about rabies prevention, pet care, and responsible
              ownership.
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => navigation.navigate("ReadingMaterialListScreen")}
            >
              <Text style={styles.buttonText}>Select</Text>
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
    height: 150, // Fixed height for image container
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  eventImage: {
    width: "100%",
    height: "100%",
    maxHeight: 150,
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
  selectButton: {
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

export default ScreenOption;
