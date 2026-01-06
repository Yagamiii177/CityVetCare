import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";

const AboutUsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("app");

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "app" && styles.activeTab]}
          onPress={() => setActiveTab("app")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "app" && styles.activeTabText,
            ]}
          >
            About the App
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "vet" && styles.activeTab]}
          onPress={() => setActiveTab("vet")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "vet" && styles.activeTabText,
            ]}
          >
            Naga City Vet Office
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "app" ? (
          <>
            <Image
              source={require("../../assets/icons/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>City Veterinary Care</Text>

            <Text style={styles.description}>
              CVC is Naga City's premier pet management app, designed to
              streamline pet registration, adoption, and veterinary services.
              Our platform connects pet owners with Naga City's Veterinary
              Office to ensure all pets are properly registered and cared for.
            </Text>

            <Text style={styles.description}>
              Features include:
              {"\n"}• Pet registration and documentation
              {"\n"}• Lost and found pet alerts
              {"\n"}• Veterinary service information
              {"\n"}• Adoption listings
              {"\n"}• Emergency reporting
            </Text>

            <Text style={styles.version}>Version 1.0.0</Text>
          </>
        ) : (
          <>
            <Image
              source={require("../../assets/icons/vet_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Naga City Veterinary Office</Text>

            <Text style={styles.description}>
              The Naga City Veterinary Office is committed to promoting
              responsible pet ownership and animal welfare throughout the city.
              Our services include:
            </Text>

            <Text style={styles.description}>
              • Free rabies vaccination programs
              {"\n"}• Pet licensing and registration
              {"\n"}• Animal health consultations
              {"\n"}• Stray animal management
              {"\n"}• Emergency veterinary services
            </Text>

            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Address:</Text>
                <Text style={styles.contactText}>
                  City Hall Compound, Naga City
                </Text>
              </View>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone:</Text>
                <Text style={styles.contactText}>(054) 881-0415</Text>
              </View>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactText}>
                  veterinary@nagacity.gov.ph
                </Text>
              </View>

              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Hours:</Text>
                <Text style={styles.contactText}>
                  Monday-Friday, 8:00 AM - 5:00 PM
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    marginTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FD7E14",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
  activeTabText: {
    color: "#FD7E14",
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FD7E14",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
    marginBottom: 20,
  },
  contactSection: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FD7E14",
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  contactLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  version: {
    fontSize: 14,
    color: "#999999",
    marginTop: 20,
    textAlign: "center",
  },
});

export default AboutUsScreen;
