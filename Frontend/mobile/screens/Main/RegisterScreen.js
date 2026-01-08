import React, { useState } from "react";
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
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../contexts/AuthContext";
import LocationPickerModal from "../../components/LocationPickerModal";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    full_name: "",
    contact_number: "",
    birthdate: "",
    address: "",
    home_latitude: null,
    home_longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [birthdateDraft, setBirthdateDraft] = useState("2000-01-01");
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  const { register } = useAuth();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatBirthdate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const openBirthdatePicker = () => {
    const initial =
      typeof formData.birthdate === "string" && formData.birthdate
        ? formData.birthdate
        : "2000-01-01";
    setBirthdateDraft(initial);
    setShowBirthdatePicker(true);
  };

  const closeBirthdatePicker = () => {
    setShowBirthdatePicker(false);
  };

  const applyBirthdateDraft = () => {
    updateField("birthdate", birthdateDraft);
    closeBirthdatePicker();
  };

  const handleLocationSelect = (locationData) => {
    updateField("address", locationData?.address || "");
    updateField("home_latitude", locationData?.latitude ?? null);
    updateField("home_longitude", locationData?.longitude ?? null);
  };

  const validateForm = () => {
    const {
      username,
      password,
      confirmPassword,
      email,
      full_name,
      contact_number,
      birthdate,
      address,
    } = formData;

    if (!username.trim()) {
      Alert.alert("Validation Error", "Username is required");
      return false;
    }

    if (username.length < 3) {
      Alert.alert("Validation Error", "Username must be at least 3 characters");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!full_name.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return false;
    }

    if (!contact_number.trim()) {
      Alert.alert("Validation Error", "Contact number is required");
      return false;
    }

    if (!birthdate) {
      Alert.alert("Validation Error", "Birthdate is required");
      return false;
    }

    if (!address.trim()) {
      Alert.alert("Validation Error", "Home address is required");
      return false;
    }

    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(contact_number.replace(/\s/g, ""))) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid Philippine mobile number (e.g., 09123456789)"
      );
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remove unnecessary fields for backend
      const { confirmPassword, username, ...registrationData } = formData;

      // Rename fields to match backend schema
      const requestData = {
        fullName: registrationData.full_name,
        email: registrationData.email,
        password: registrationData.password,
        confirmPassword: confirmPassword,
        contactNumber: registrationData.contact_number,
        address: registrationData.address,
        birthdate: registrationData.birthdate,
        homeLatitude: registrationData.home_latitude,
        homeLongitude: registrationData.home_longitude,
      };

      console.log("Attempting registration with:", requestData);

      const result = await register(requestData);

      console.log("Registration result:", result);

      if (result.success) {
        Alert.alert(
          "Success",
          "Registration successful! Please login with your credentials.",
          [
            {
              text: "OK",
              onPress: () => navigation.replace("Login"),
            },
          ]
        );
      } else {
        // Show detailed error message
        const errorMsg =
          result.error || "Registration failed. Please try again.";
        console.error("Registration failed:", errorMsg);
        Alert.alert(
          "Registration Failed",
          errorMsg +
            "\n\nPlease check:\n• Backend server is running\n• Network connection is active\n• All fields are valid"
        );
      }
    } catch (error) {
      console.error("Registration exception:", error);
      Alert.alert(
        "Connection Error",
        `Cannot connect to server.\n\nError: ${error.message}\n\nPlease ensure:\n• Backend server is running on port 3000\n• Your device can reach the server`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Ionicons name="chevron-back-outline" size={28} color="#333" />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require("../../assets/icons/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please enter your details below</Text>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={formData.username}
              onChangeText={(value) => updateField("username", value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => updateField("email", value)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-circle-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={formData.full_name}
              onChangeText={(value) => updateField("full_name", value)}
              autoCapitalize="words"
            />
          </View>

          {/* Contact Number Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number (09XXXXXXXXX)"
              placeholderTextColor="#999"
              value={formData.contact_number}
              onChangeText={(value) => updateField("contact_number", value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Birthdate Picker */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={openBirthdatePicker}
            activeOpacity={0.85}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <View style={styles.pickerTextContainer}>
              <Text
                style={
                  formData.birthdate
                    ? styles.pickerText
                    : styles.placeholderText
                }
                numberOfLines={1}
              >
                {formData.birthdate
                  ? formatBirthdate(formData.birthdate)
                  : "Birthdate"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#666" />
          </TouchableOpacity>

          {/* Birthdate Picker (Calendar Modal) */}
          <Modal
            visible={showBirthdatePicker}
            transparent
            animationType="fade"
            onRequestClose={closeBirthdatePicker}
          >
            <Pressable
              style={styles.birthdateModalOverlay}
              onPress={closeBirthdatePicker}
            >
              <Pressable style={styles.birthdateModalCard} onPress={() => {}}>
                <View style={styles.birthdateModalHeader}>
                  <TouchableOpacity
                    onPress={closeBirthdatePicker}
                    style={styles.birthdateModalHeaderButton}
                  >
                    <Text style={styles.birthdateModalHeaderTextSecondary}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={applyBirthdateDraft}
                    style={styles.birthdateModalHeaderButton}
                  >
                    <Text style={styles.birthdateModalHeaderTextPrimary}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>

                <Calendar
                  current={birthdateDraft}
                  markedDates={{
                    [birthdateDraft]: {
                      selected: true,
                      selectedColor: "#FA8630",
                    },
                  }}
                  maxDate={new Date().toISOString().slice(0, 10)}
                  onDayPress={(day) => {
                    if (day?.dateString) setBirthdateDraft(day.dateString);
                  }}
                  theme={{
                    todayTextColor: "#FA8630",
                    arrowColor: "#FA8630",
                    selectedDayBackgroundColor: "#FA8630",
                    selectedDayTextColor: "#ffffff",
                  }}
                />
              </Pressable>
            </Pressable>
          </Modal>

          {/* Home Address */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Home Address"
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(value) => updateField("address", value)}
              autoCapitalize="words"
            />

            <TouchableOpacity
              onPress={() => setIsLocationPickerVisible(true)}
              style={styles.mapButton}
            >
              <Ionicons name="location" size={18} color="#FFF" />
              <Text style={styles.mapButtonText}>Map</Text>
            </TouchableOpacity>
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
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => updateField("password", value)}
              secureTextEntry={securePassword}
            />
            <TouchableOpacity
              onPress={() => setSecurePassword(!securePassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={securePassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField("confirmPassword", value)}
              secureTextEntry={secureConfirm}
            />
            <TouchableOpacity
              onPress={() => setSecureConfirm(!secureConfirm)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={secureConfirm ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <LocationPickerModal
        visible={isLocationPickerVisible}
        onClose={() => setIsLocationPickerVisible(false)}
        onSelectLocation={handleLocationSelect}
      />
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
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 40,
    left: 20,
    padding: 4,
    zIndex: 10,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
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
  pickerTextContainer: {
    flex: 1,
    height: 50,
    justifyContent: "center",
  },
  pickerText: {
    color: "#1a1a1a",
    fontSize: 16,
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FA8630",
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
    marginLeft: 10,
  },
  mapButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#666",
    fontSize: 15,
  },
  loginLink: {
    color: "#FA8630",
    fontSize: 15,
    fontWeight: "bold",
  },

  birthdateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    padding: 12,
  },
  birthdateModalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  birthdateModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  birthdateModalHeaderButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  birthdateModalHeaderTextPrimary: {
    color: "#FA8630",
    fontSize: 16,
    fontWeight: "bold",
  },
  birthdateModalHeaderTextSecondary: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegisterScreen;
