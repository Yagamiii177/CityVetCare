import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const RegisterPet = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    type: "dog", // Default to dog
    sex: "",
    isCastrated: false,
    color: "",
    markings: "",
  });

  useEffect(() => {
    // Request camera roll permissions on mount
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photos to upload images"
        );
      }
    })();
  }, []);

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name) {
      Alert.alert("Error", "Please enter the pet's name");
      return;
    }

    if (!formData.breed) {
      Alert.alert("Error", "Please enter the pet's breed");
      return;
    }

    if (!formData.sex) {
      Alert.alert("Error", "Please select the pet's sex");
      return;
    }

    if (!formData.color) {
      Alert.alert("Error", "Please enter the pet's color");
      return;
    }

    // Validate that at least one image is uploaded
    const hasImages = Object.values(images).some((image) => image !== null);
    if (!hasImages) {
      Alert.alert("Error", "Please upload at least one photo of the pet");
      return;
    }

    // Prepare data for submission
    const petData = {
      ...formData,
      images: Object.entries(images)
        .filter(([_, uri]) => uri !== null)
        .map(([angle, uri]) => ({ angle, uri })),
    };

    // Navigate to SuccessPage with all the data
    navigation.navigate("Success", {
      petData,
      // You might want to generate a unique ID here
      petId: `PET-${Date.now()}`,
    });
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = async (angle) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages({ ...images, [angle]: result.assets[0].uri });
    }
  };

  const takePhoto = async (angle) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera access to take photos"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages({ ...images, [angle]: result.assets[0].uri });
    }
  };

  const removeImage = (angle) => {
    setImages({ ...images, [angle]: null });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Pet</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.orangeDivider} />
      </View>

      {/* Animal Information Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="paw-outline" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>Animal Information</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Basic details about the Pet
        </Text>

        <FormInput
          label="Name *"
          value={formData.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="e.g Sky"
        />
        <FormInput
          label="Breed *"
          value={formData.breed}
          onChangeText={(text) => handleChange("breed", text)}
          placeholder="e.g Aspin"
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type *</Text>
          <View style={styles.typeButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "dog" && styles.typeButtonActive,
              ]}
              onPress={() => handleChange("type", "dog")}>
              <Ionicons
                name="paw-outline"
                size={24}
                color={formData.type === "dog" ? "#fff" : "#FD7E14"}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "dog" && styles.typeButtonTextActive,
                ]}>
                Dog
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "cat" && styles.typeButtonActive,
              ]}
              onPress={() => handleChange("type", "cat")}>
              <Ionicons
                name="paw-outline"
                size={24}
                color={formData.type === "cat" ? "#fff" : "#FD7E14"}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "cat" && styles.typeButtonTextActive,
                ]}>
                Cat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sex *</Text>
          <View style={styles.sexButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === "male" && styles.sexButtonActive,
              ]}
              onPress={() => handleChange("sex", "male")}>
              <Ionicons
                name="male-outline"
                size={24}
                color={formData.sex === "male" ? "#fff" : "#FD7E14"}
              />
              <Text
                style={[
                  styles.sexButtonText,
                  formData.sex === "male" && styles.sexButtonTextActive,
                ]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sexButton,
                formData.sex === "female" && styles.sexButtonActive,
              ]}
              onPress={() => handleChange("sex", "female")}>
              <Ionicons
                name="female-outline"
                size={24}
                color={formData.sex === "female" ? "#fff" : "#FD7E14"}
              />
              <Text
                style={[
                  styles.sexButtonText,
                  formData.sex === "female" && styles.sexButtonTextActive,
                ]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
          {formData.sex && (
            <View style={styles.castratedContainer}>
              <Switch
                value={formData.isCastrated}
                onValueChange={(value) => handleChange("isCastrated", value)}
                thumbColor={formData.isCastrated ? "#FD7E14" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#FD7E1477" }}
              />
              <Text style={styles.castratedText}>Castrated/Spayed</Text>
            </View>
          )}
        </View>

        <FormInput
          label="Color *"
          value={formData.color}
          onChangeText={(text) => handleChange("color", text)}
          placeholder="e.g Brown"
        />

        <FormInput
          label="Markings"
          value={formData.markings}
          onChangeText={(text) => handleChange("markings", text)}
          placeholder="Distinctive markings or features"
        />
      </View>

      {/* Animal Images Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="camera-outline" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>Animal Images *</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Please provide clear photos from multiple angles
        </Text>

        {Object.entries(images).map(([angle, uri]) => (
          <View key={angle} style={styles.imageUploadGroup}>
            <Text style={styles.label}>
              {angle.charAt(0).toUpperCase() + angle.slice(1)} View
            </Text>
            {uri ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <View style={styles.imageButtons}>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={() => pickImage(angle)}>
                    <Text style={styles.imageButtonText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={() => removeImage(angle)}>
                    <Text style={styles.imageButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={styles.uploadOptionButton}
                  onPress={() => pickImage(angle)}>
                  <Ionicons name="image" size={20} color="#FD7E14" />
                  <Text style={styles.uploadOptionText}>Choose Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadOptionButton}
                  onPress={() => takePhoto(angle)}>
                  <Ionicons name="camera" size={20} color="#FD7E14" />
                  <Text style={styles.uploadOptionText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Register Pet</Text>
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
    padding: 1,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  orangeDivider: {
    height: 2.5,
    width: "95%",
    backgroundColor: "#FD7E14",
    alignSelf: "center",
    marginTop: 15,
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
    marginHorizontal: 15,
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
  typeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  typeButton: {
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
  typeButtonActive: {
    backgroundColor: "#FD7E14",
  },
  typeButtonText: {
    marginLeft: 5,
    color: "#FD7E14",
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  sexButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  sexButton: {
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
  sexButtonActive: {
    backgroundColor: "#FD7E14",
  },
  sexButtonText: {
    marginLeft: 5,
    color: "#FD7E14",
    fontWeight: "500",
  },
  sexButtonTextActive: {
    color: "#fff",
  },
  castratedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  castratedText: {
    marginLeft: 8,
    color: "#666",
  },
  imageUploadGroup: {
    marginBottom: 20,
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  uploadOptionButton: {
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
  uploadOptionText: {
    marginLeft: 5,
    color: "#FD7E14",
    fontWeight: "500",
  },
  imagePreviewWrapper: {
    marginTop: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  imageActionButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FD7E14",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#FD7E14",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    marginHorizontal: 15,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterPet;
