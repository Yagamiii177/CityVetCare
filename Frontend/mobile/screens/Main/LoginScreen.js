import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [userType, setUserType] = useState("pet_owner"); // admin or pet_owner

  const { login, isAuthenticated, user } = useAuth();

  // Navigate if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check user type and navigate accordingly
      if (user.userType === "admin") {
        navigation.replace("AnimalLoggerMain");
      } else {
        navigation.replace("Main");
      }
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert(
        "Validation Error",
        `Please enter your ${userType === "admin" ? "username" : "email"}`
      );
      return;
    }

    if (password.length < 4) {
      Alert.alert("Validation Error", "Password must be at least 4 characters");
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting ${userType} login for:`, username);
      const result = await login(username.trim(), password, userType);

      console.log("Login result:", result);

      if (result.success) {
        // Navigation handled by AuthContext and useEffect
        if (userType === "admin") {
          // Redirect veterinarian to Animal Logger
          navigation.replace("AnimalLoggerMain");
        } else {
          // Pet owners go to main app
          navigation.replace("Main");
        }
      } else {
        Alert.alert(
          "Login Failed",
          result.error ||
            "Invalid credentials. Please check your username and password."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Connection Error",
        `Cannot connect to server.\n\nError: ${error.message}\n\nPlease ensure the backend server is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleEmergencyReport = () => {
    // Navigate directly to report incident screen
    navigation.navigate("ReportIncident");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* Logo */}
          <Image
            source={require("../../assets/icons/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Welcome to CityVetCare</Text>

          {/* Login as Label */}
          <View style={styles.loginAsContainer}>
            <Ionicons name="log-in-outline" size={18} color="#FA8630" />
            <Text style={styles.loginAsLabel}>Login as:</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "pet_owner" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("pet_owner")}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={userType === "pet_owner" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "pet_owner" && styles.userTypeTextActive,
                ]}
              >
                Pet Owner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "admin" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("admin")}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={userType === "admin" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "admin" && styles.userTypeTextActive,
                ]}
              >
                Veterinarian
              </Text>
            </TouchableOpacity>
          </View>

          {/* Username/Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name={userType === "admin" ? "person-outline" : "mail-outline"}
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={userType === "admin" ? "Username" : "Email"}
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={userType === "admin" ? "default" : "email-address"}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={secureText ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Emergency Report Button */}
          <TouchableOpacity
            onPress={handleEmergencyReport}
            style={styles.emergencyButton}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color="#fff"
            />
            <Text style={styles.emergencyButtonText}>Report Without Login</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.signupLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 30,
    textAlign: "center",
  },
  loginAsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  loginAsLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  userTypeButtonActive: {
    backgroundColor: "#FA8630",
    borderColor: "#FA8630",
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  userTypeTextActive: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#1a1a1a",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: "#FA8630",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#FA8630",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#666",
    fontSize: 15,
  },
  signupLink: {
    color: "#FA8630",
    fontSize: 15,
    fontWeight: "bold",
  },
  emergencyButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#dc3545",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    opacity: 0.85,
  },
  emergencyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
