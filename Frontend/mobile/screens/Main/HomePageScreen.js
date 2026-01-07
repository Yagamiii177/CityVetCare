import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomTabNavigator from "../../components/BottomNavigation";
import { Ionicons } from "@expo/vector-icons";

// Get screen dimensions
const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isTablet = width >= 600;

// Assuming you have these images in your assets folder
const iconImages = {
  registerPet: require("../../assets/icons/register_pet_icon.png"),
  adoptPet: require("../../assets/icons/adopt_pet_icon.png"),
  readingMaterials: require("../../assets/icons/reading_materials_icon.png"),
  reportIncident: require("../../assets/icons/report_icon.png"),
  announcements: require("../../assets/CampaignManagement/image7.png"), // Changed to a banner image
  pawLogo: require("../../assets/icons/logo.png"),
};

const HomePageScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoButton}
          onPress={() => navigation.navigate("AboutUs")}
        >
          <Image
            source={iconImages.pawLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={{ flex: 2 }} />
        {/* Right spacer to keep layout symmetrical */}
        <View style={{ flex: 1 }} />
      </View>

      {/* Announcement Button - Now an image */}
      <View style={styles.announcementHeaderRow}>
        <TouchableOpacity onPress={() => navigation.navigate("Announcement")}>
          <Text style={styles.announcementHeader}>Announcements</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.announcementButton}
        onPress={() => navigation.navigate("Announcement")}
      >
        <Image
          source={iconImages.announcements}
          style={styles.announcementImage}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("PetVaccination")}
        >
          <Image
            source={iconImages.registerPet}
            style={styles.largeIconImage}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Register a Pet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AdoptionList")}
        >
          <Image
            source={iconImages.adoptPet}
            style={styles.largeIconImage}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Adopt a Pet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("ScreenOption")}
        >
          <Image
            source={iconImages.readingMaterials}
            style={styles.largeIconImage}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Events and Reading Materials</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("ReportIncident")}
        >
          <Image
            source={iconImages.reportIncident}
            style={styles.largeIconImage}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Report an Incident</Text>
        </TouchableOpacity>
      </View>

      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F1",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 15,
    marginTop: 7,
  },
  logoButton: {
    flex: 1,
    alignItems: "flex-start",
  },
  announcementHeaderContainer: {
    display: "none",
  },

  logoImage: {
    width: isTablet ? 70 : 50,
    height: isTablet ? 70 : 50,
  },
  smallIconImage: {
    width: isTablet ? 30 : 24,
    height: isTablet ? 30 : 24,
  },
  largeIconImage: {
    width: isTablet ? 90 : 75,
    height: isTablet ? 90 : 75,
  },
  announcementHeader: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "350",
    color: "#000000",
  },
  announcementButton: {
    backgroundColor: "transparent", // Remove background color
    padding: 0, // Remove padding
    marginHorizontal: width * 0.05,
    borderRadius: 10,
    marginBottom: height * 0.02,
    height: 200, // Adjust height as needed
    overflow: "hidden", // Ensure the image stays within rounded corners
  },
  announcementImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10, // Match the button's borderRadius
  },
  announcementHeaderRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  announcementHeader: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "700",
    color: "#000",
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: isTablet ? "48%" : "48%",
    height: isTablet ? height * 0.25 : height * 0.2,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.02,
    padding: isTablet ? 15 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    marginTop: height * 0.01,
    fontSize: isTablet ? 18 : 14,
    fontWeight: "350",
    color: "#000000",
    textAlign: "center",
  },
});

export default HomePageScreen;
