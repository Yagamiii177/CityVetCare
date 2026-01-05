import React from "react";
import { View, TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const iconImages = {
    qrCode: require("../assets/icons/qr_icon.png"),
  };

  const tabs = [
    { name: "Home", icon: "home-outline", screen: "HomePage" },
    { name: "Map", icon: "map-outline", screen: "MapNearbyClinics" },
    { name: "QR", icon: "qrCode", screen: "QR" },
    {
      name: "Stray List",
      icon: "paw-outline",
      screen: "StrayList",
    },
    { name: "Profile", icon: "person-outline", screen: "Profile" },
  ];

  const handlePress = (screen) => {
    if (screen) navigation.navigate(screen);
  };

  const isActive = (screenName) => {
    return route.name === screenName;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <View key={index} style={styles.tabContainer}>
          {index === 2 ? ( // Home button (center position)
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.centerButton,
                  isActive(tab.screen) && styles.activeCenterButton,
                ]}
                onPress={() => handlePress(tab.screen)}
              >
                <Image
                  source={iconImages.qrCode}
                  style={styles.qrIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.homeText,
                  isActive(tab.screen) && styles.activeHomeText,
                ]}
              >
                Scan
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => handlePress(tab.screen)}
            >
              <Ionicons
                name={
                  isActive(tab.screen)
                    ? tab.icon.replace("-outline", "")
                    : tab.icon
                }
                size={24}
                color={isActive(tab.screen) ? "#FD7E14" : "#FD7E14"}
              />
              <Text
                style={[
                  styles.tabText,
                  isActive(tab.screen) && styles.activeTabText,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.3,
    borderTopColor: "#0a0a0a",
    paddingHorizontal: 10,
    paddingBottom: 13,
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
  },
  tabContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  qrIcon: {
    width: 50,
    height: 50,
    tintColor: "#FD7E14",
    marginTop: 9,
  },
  activeTabText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  centerButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FD7E14",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  activeCenterButton: {
    backgroundColor: "white",
  },
  homeText: {
    fontSize: 11,
    marginTop: 4,
    color: "#333",
    position: "absolute",
    bottom: -18,
    fontWeight: "bold",
  },
  activeHomeText: {
    color: "#FF6B6B",
  },
});

export default BottomTabNavigator;
