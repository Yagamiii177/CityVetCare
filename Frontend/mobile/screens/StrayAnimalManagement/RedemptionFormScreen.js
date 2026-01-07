import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

const RedemptionForm = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const pet = params?.pet || {};
  const [proofImages, setProofImages] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleSubmit = async () => {
    // Required fields validation
    const requiredFields = ["fullName", "age", "phone", "email", "address"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      Alert.alert("Incomplete Form", "Please fill in all required fields");
      return;
    }

    if (proofImages.length === 0) {
      Alert.alert(
        "Proof Required",
        "Please upload at least one proof of ownership"
      );
      return;
    }

    try {
      // For now we only submit metadata (images not uploaded)
      // TODO: extend backend to handle file uploads for proofs
      const userDataStr = await AsyncStorage.getItem("@cityvetcare_user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const ownerId = userData?.owner_id || userData?.id;

      const strayId = pet?.id ? parseInt(pet.id) : null;

      if (!ownerId) {
        Alert.alert("Error", "Please log in to submit a redemption request");
        return;
      }

      if (!strayId) {
        Alert.alert(
          "Missing Pet",
          "Please start redemption from a specific pet in the Captured list."
        );
        return;
      }

      const payload = {
        stray_id: strayId,
        owner_id: ownerId,
        remarks: `Redemption request from ${formData.fullName}`,
      };

      await api.redemptionRequests.create(payload);

      Alert.alert(
        "Redemption Submitted",
        "Thank you for your redemption request! We will verify your information and contact you shortly.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Failed to submit redemption request:", error);
      Alert.alert(
        "Submission Failed",
        "Unable to submit your redemption request. Please try again later."
      );
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setProofImages([...proofImages, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera access to take photos of your proof"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProofImages([...proofImages, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...proofImages];
    updatedImages.splice(index, 1);
    setProofImages(updatedImages);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redemption Application</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.orangeDivider} />
      </View>

      {/* Pet Info */}
      <View style={styles.petInfoContainer}>
        <Image
          source={
            pet.imageUrls && pet.imageUrls.length > 0 && pet.imageUrls[0]
              ? { uri: pet.imageUrls[0] }
              : require("../../assets/icons/logo.png")
          }
          style={styles.petImage}
          resizeMode="cover"
        />
        <Text style={styles.petName}>
          {pet.name || "Unnamed"} - {pet.breed || "Mixed Breed"}
        </Text>
      </View>

      {/* 1. Personal Information */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>1. Personal Information</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Basic identity and contact details
        </Text>

        <FormInput
          label="Full Name *"
          value={formData.fullName}
          onChangeText={(text) => handleChange("fullName", text)}
        />

        <FormInput
          label="Age *"
          value={formData.age}
          onChangeText={(text) => handleChange("age", text)}
          keyboardType="numeric"
        />

        <FormInput
          label="Contact Number *"
          value={formData.phone}
          onChangeText={(text) => handleChange("phone", text)}
          keyboardType="phone-pad"
        />

        <FormInput
          label="Email Address *"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
        />

        <FormInput
          label="Home Address *"
          value={formData.address}
          onChangeText={(text) => handleChange("address", text)}
          multiline
        />
      </View>

      {/* 2. Proof of Ownership */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="images" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>2. Proof of Ownership *</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Upload any documents or photos that prove you are the owner
        </Text>

        <View style={styles.uploadButtonsContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image" size={20} color="#FD7E14" />
            <Text style={styles.uploadButtonText}>Choose Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color="#FD7E14" />
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {proofImages.length > 0 && (
          <View style={styles.imagesPreviewContainer}>
            <Text style={styles.uploadCountText}>
              {proofImages.length} {proofImages.length === 1 ? "file" : "files"}{" "}
              uploaded
            </Text>
            <View style={styles.imagesGrid}>
              {proofImages.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.proofImagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Redemption Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Reusable Components
const FormInput = ({ label, ...props }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orangeDivider: {
    height: 2.5,
    width: "95%",
    backgroundColor: "#FD7E14",
    alignSelf: "center",
    marginTop: 15,
  },
  petInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "white",
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  uploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#FD7E14",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  uploadButtonText: {
    marginLeft: 5,
    color: "#FD7E14",
    fontWeight: "500",
  },
  imagesPreviewContainer: {
    marginTop: 15,
  },
  uploadCountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imagePreviewWrapper: {
    width: "48%",
    marginBottom: 10,
    position: "relative",
  },
  proofImagePreview: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#FD7E14",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RedemptionForm;
