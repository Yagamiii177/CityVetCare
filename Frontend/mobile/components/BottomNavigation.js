import React, { useCallback, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: "Map", icon: "map-outline", screen: "MapNearbyClinics" },
    { name: "Stray List", icon: "paw-outline", screen: "StrayList" },
    { name: "Home", icon: "home-outline", screen: "HomePage" },
    {
      name: "Notification",
      icon: "notifications-outline",
      screen: "Notifications",
    },
    { name: "Profile", icon: "person-outline", screen: "Profile" },
  ];

  const handlePress = (screen) => {
    if (screen) navigation.navigate(screen);
  };

  const isActive = (screenName) => {
    return route.name === screenName;
  };

  const [unread, setUnread] = useState(0);
  const loadUnread = useCallback(async () => {
    try {
      const data = await api.notifications.getUnreadCount();
      setUnread(data?.unread ?? 0);
    } catch (e) {
      setUnread(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnread();
      const interval = setInterval(loadUnread, 15000);
      return () => clearInterval(interval);
    }, [loadUnread])
  );

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
                <Ionicons
                  name={isActive(tab.screen) ? "home" : "home-outline"}
                  size={32}
                  color="#FD7E14"
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.homeText,
                  isActive(tab.screen) && styles.activeHomeText,
                ]}
              >
                Home
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => handlePress(tab.screen)}
            >
              <View>
                <Ionicons
                  name={
                    isActive(tab.screen)
                      ? tab.icon.replace("-outline", "")
                      : tab.icon
                  }
                  size={24}
                  color={isActive(tab.screen) ? "#FD7E14" : "#FD7E14"}
                />
                {tab.name === "Notification" && unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unread > 99 ? "99+" : unread}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabText,
                  isActive(tab.screen) && styles.activeTabText,
                  tab.name === "Notification" &&
                  unread > 0 &&
                  !isActive(tab.screen)
                    ? styles.attentionTabText
                    : null,
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
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#EF4444",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  activeTabText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  attentionTabText: {
    color: "#EF4444",
    fontWeight: "700",
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
