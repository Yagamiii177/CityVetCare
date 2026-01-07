import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

const VetHomeScreen = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation();
  const displayName =
    user?.fullName || user?.full_name || user?.username || "Vet Home";
  const usernameLabel = user?.username ? `@${user.username}` : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.bgAccentTop} />
      <View style={styles.bgAccentBottom} />

      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <Image
            source={require("../../../assets/icons/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.heroTextWrap}>
            <Text style={styles.title}>{displayName}</Text>
            {usernameLabel && (
              <Text style={styles.username}>{usernameLabel}</Text>
            )}
            <Text style={styles.subtitle}>Tools for your daily rounds</Text>
          </View>
        </View>
        <View style={styles.heroPillRow}>
          <View style={styles.heroPill}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#FD7E14"
            />
            <Text style={styles.heroPillText}>Signed in as Veterinarian</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.primary]}>
          <View style={styles.actionIconCirclePrimary}>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </View>
          <View style={styles.actionTextGroup}>
            <Text style={[styles.actionText, styles.actionTextLight]}>
              Register a Pet
            </Text>
            <Text style={styles.actionSubText}>Create a new pet profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondary]}>
          <View style={styles.actionIconCircleSoft}>
            <Ionicons name="medkit-outline" size={22} color="#E26A00" />
          </View>
          <View style={styles.actionTextGroup}>
            <Text style={[styles.actionText, styles.actionTextDark]}>
              Add a Vaccination Record
            </Text>
            <Text style={styles.actionSubTextAlt}>Log recent treatments</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiary]}
          onPress={() => navigation.navigate("AnimalLoggerMain")}
        >
          <View style={styles.actionIconCircleSoft}>
            <Ionicons name="paw-outline" size={22} color="#E26A00" />
          </View>
          <View style={styles.actionTextGroup}>
            <Text style={[styles.actionText, styles.actionTextDark]}>
              Register a Stray
            </Text>
            <Text style={styles.actionSubTextAlt}>
              Capture field intake details
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={() => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                  await logout();
                  navigation.replace("Login");
                },
              },
            ]);
          }}
        >
          <View style={styles.actionIconCircleSoft}>
            <Ionicons name="log-out-outline" size={22} color="#E26A00" />
          </View>
          <View style={styles.actionTextGroup}>
            <Text style={[styles.actionText, styles.actionTextDark]}>
              Logout
            </Text>
            <Text style={styles.actionSubTextAlt}>Return to login screen</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#F7F3EF",
    justifyContent: "center",
    gap: 18,
    position: "relative",
  },
  bgAccentTop: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FD7E1415",
  },
  bgAccentBottom: {
    position: "absolute",
    bottom: -70,
    left: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFE9D640",
  },
  heroCard: {
    backgroundColor: "#fff",
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 6,
  },
  heroTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
  username: {
    fontSize: 14,
    color: "#C45D0B",
    fontWeight: "600",
    marginBottom: 2,
  },
  heroPillRow: {
    width: "100%",
    marginTop: 14,
    alignItems: "flex-start",
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFF1E6",
    borderWidth: 1,
    borderColor: "#FD7E1430",
  },
  heroPillText: {
    color: "#C45D0B",
    fontWeight: "700",
    fontSize: 13,
  },
  actions: {
    marginTop: 32,
    width: "100%",
    gap: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3D0B5",
  },
  primary: {
    backgroundColor: "#FF8F3A",
  },
  secondary: {
    backgroundColor: "#FFF3E7",
  },
  tertiary: {
    backgroundColor: "#FFF9F3",
  },
  logoutButton: {
    backgroundColor: "#FFFDF9",
  },
  actionIconCirclePrimary: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFB066",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconCircleSoft: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFEFE1",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextGroup: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionTextLight: {
    color: "#fff",
  },
  actionTextDark: {
    color: "#C35A00",
  },
  actionSubText: {
    marginTop: 2,
    color: "#FDE1CB",
    fontSize: 13,
    fontWeight: "500",
  },
  actionSubTextAlt: {
    marginTop: 2,
    color: "#A34B00",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default VetHomeScreen;
