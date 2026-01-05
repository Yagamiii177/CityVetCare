
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const NotFound = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Track 404 navigation in development only
  }, []);

  const handleGoHome = () => {
    navigation.navigate("Main", { screen: "HomePage" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={100} color="#FD7E14" />
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Screen not found</Text>
        <Text style={styles.description}>
          The screen you're looking for doesn't exist or has been moved.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Ionicons name="home-outline" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#343A40",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FD7E14",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotFound;
