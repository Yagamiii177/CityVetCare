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
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

const AdoptionForm = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const pet = params?.pet || {};

  // Dropdown options
  const residenceOptions = [
    "House",
    "Apartment",
    "Condo",
    "Townhouse",
    "Other",
  ];
  const familiarityOptions = ["Beginner", "Intermediate", "Expert"];
  const petLocationOptions = [
    "Indoors only",
    "Outdoors only",
    "Both indoors and outdoors",
  ];

  // State for dropdowns
  const [showResidenceDropdown, setShowResidenceDropdown] = useState(false);
  const [showFamiliarityDropdown, setShowFamiliarityDropdown] = useState(false);
  const [showPetLocationDropdown, setShowPetLocationDropdown] = useState(false);
  const [idImage, setIdImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // 1. Personal Information
    fullName: "",
    age: "",
    phone: "",
    email: "",
    address: "",
    validId: "",

    // 2. Living Situation
    residenceType: "",
    ownershipStatus: "",
    landlordPermission: false,
    fencedYard: false,
    householdMembers: "",
    hasChildren: false,
    childrenAges: "",

    // 3. Pet Experience
    previousPets: false,
    currentPets: false,
    currentPetsDetails: "",
    petCareFamiliarity: "",

    // 4. Commitment & Compatibility
    adoptionReason: "",
    aloneHours: "",
    petLocation: "",
    canCommitVetVisits: false,
    willingToReturn: false,

    // 5. Declarations
    agreeSpayNeuter: false,
    agreeNoAbandonment: false,
    confirmInfoTruthful: false,
  });

  const handleSubmit = async () => {
    // Required fields validation
    const requiredFields = [
      "fullName",
      "age",
      "phone",
      "email",
      "address",
      "residenceType",
      "ownershipStatus",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      Alert.alert("Incomplete Form", "Please fill in all required fields");
      return;
    }

    if (!formData.confirmInfoTruthful) {
      Alert.alert(
        "Agreement Required",
        "You must confirm the information is truthful"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current user ID from storage
      const userDataStr = await AsyncStorage.getItem("@cityvetcare_user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const adopterId = userData?.owner_id || userData?.id;

      if (!adopterId) {
        Alert.alert("Error", "Please log in to submit an adoption request");
        return;
      }

      // Submit adoption request
      const adoptionRequest = {
        stray_id: parseInt(pet.id),
        adopter_id: adopterId,
        applicant_details: {
          fullName: formData.fullName,
          age: formData.age,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          residenceType: formData.residenceType,
          ownershipStatus: formData.ownershipStatus,
          landlordPermission: formData.landlordPermission,
          fencedYard: formData.fencedYard,
          householdMembers: formData.householdMembers,
          hasChildren: formData.hasChildren,
          childrenAges: formData.childrenAges,
          previousPets: formData.previousPets,
          currentPets: formData.currentPets,
          currentPetsDetails: formData.currentPetsDetails,
          petCareFamiliarity: formData.petCareFamiliarity,
          adoptionReason: formData.adoptionReason,
          aloneHours: formData.aloneHours,
          petLocation: formData.petLocation,
          canCommitVetVisits: formData.canCommitVetVisits,
          willingToReturn: formData.willingToReturn,
        },
      };

      await api.adoptionRequests.create(adoptionRequest);

      Alert.alert(
        "Application Submitted",
        "Thank you for your adoption application! We will review your information shortly.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Failed to submit adoption request:", error);
      Alert.alert(
        "Submission Failed",
        "Unable to submit your adoption request. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const toggleCheckbox = (name) => {
    setFormData({ ...formData, [name]: !formData[name] });
  };

  const selectResidenceType = (option) => {
    handleChange("residenceType", option);
    setShowResidenceDropdown(false);
  };

  const selectFamiliarity = (option) => {
    handleChange("petCareFamiliarity", option);
    setShowFamiliarityDropdown(false);
  };

  const selectPetLocation = (option) => {
    handleChange("petLocation", option);
    setShowPetLocationDropdown(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
      handleChange("validId", "ID uploaded");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera access to take your ID photo"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
      handleChange("validId", "ID uploaded");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} color="blac" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adoption Application</Text>
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
              : DEFAULT_PET_IMAGE
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload Valid ID *</Text>
          <View style={styles.uploadButtonsContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="image" size={20} color="#FD7E14" />
              <Text style={styles.uploadButtonText}>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Ionicons name="camera" size={20} color="#FD7E14" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
          {idImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: idImage }} style={styles.idImagePreview} />
              <Text style={styles.uploadSuccessText}>
                ID uploaded successfully
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. Living Situation */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="home" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>2. Living Situation</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Environment where the pet will live
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type of Residence *</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setShowResidenceDropdown(!showResidenceDropdown)}
          >
            <Text
              style={
                formData.residenceType
                  ? styles.dropdownSelectedText
                  : styles.dropdownPlaceholder
              }
            >
              {formData.residenceType || "Select residence type"}
            </Text>
            <Ionicons
              name={showResidenceDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          {showResidenceDropdown && (
            <View style={styles.dropdownOptions}>
              {residenceOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => selectResidenceType(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ownership Status *</Text>
          <View style={styles.radioGroup}>
            <RadioOption
              label="Owned"
              selected={formData.ownershipStatus === "owned"}
              onPress={() => handleChange("ownershipStatus", "owned")}
            />
            <RadioOption
              label="Rented"
              selected={formData.ownershipStatus === "rented"}
              onPress={() => handleChange("ownershipStatus", "rented")}
            />
          </View>
        </View>

        {formData.ownershipStatus === "rented" && (
          <CheckboxOption
            label="I have landlord permission to have pets"
            value={formData.landlordPermission}
            onPress={() => toggleCheckbox("landlordPermission")}
          />
        )}

        <CheckboxOption
          label="I have a fenced yard"
          value={formData.fencedYard}
          onPress={() => toggleCheckbox("fencedYard")}
        />

        <FormInput
          label="Number of People in Household"
          value={formData.householdMembers}
          onChangeText={(text) => handleChange("householdMembers", text)}
          keyboardType="numeric"
        />

        <CheckboxOption
          label="There are children at home"
          value={formData.hasChildren}
          onPress={() => toggleCheckbox("hasChildren")}
        />

        {formData.hasChildren && (
          <FormInput
            label="Children's Ages"
            value={formData.childrenAges}
            onChangeText={(text) => handleChange("childrenAges", text)}
            placeholder="e.g. 5, 8, 12"
          />
        )}
      </View>

      {/* 3. Pet Experience */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="paw" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>3. Pet Experience</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Your familiarity with pets
        </Text>

        <CheckboxOption
          label="I have owned a pet before"
          value={formData.previousPets}
          onPress={() => toggleCheckbox("previousPets")}
        />

        <CheckboxOption
          label="I currently own pets"
          value={formData.currentPets}
          onPress={() => toggleCheckbox("currentPets")}
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Familiarity with pet care</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setShowFamiliarityDropdown(!showFamiliarityDropdown)}
          >
            <Text
              style={
                formData.petCareFamiliarity
                  ? styles.dropdownSelectedText
                  : styles.dropdownPlaceholder
              }
            >
              {formData.petCareFamiliarity || "Select your experience level"}
            </Text>
            <Ionicons
              name={showFamiliarityDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          {showFamiliarityDropdown && (
            <View style={styles.dropdownOptions}>
              {familiarityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => selectFamiliarity(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 4. Commitment & Compatibility */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>4. Commitment & Compatibility</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Long-term responsibility and proper match
        </Text>

        <FormInput
          label="Why are you adopting this pet?"
          value={formData.adoptionReason}
          onChangeText={(text) => handleChange("adoptionReason", text)}
          multiline
        />

        <FormInput
          label="Hours pet will be alone daily"
          value={formData.aloneHours}
          onChangeText={(text) => handleChange("aloneHours", text)}
          keyboardType="numeric"
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Will the pet be indoors or outdoors?</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setShowPetLocationDropdown(!showPetLocationDropdown)}
          >
            <Text
              style={
                formData.petLocation
                  ? styles.dropdownSelectedText
                  : styles.dropdownPlaceholder
              }
            >
              {formData.petLocation || "Select pet location"}
            </Text>
            <Ionicons
              name={showPetLocationDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          {showPetLocationDropdown && (
            <View style={styles.dropdownOptions}>
              {petLocationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => selectPetLocation(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <CheckboxOption
          label="I can commit to regular vet visits and vaccinations"
          value={formData.canCommitVetVisits}
          onPress={() => toggleCheckbox("canCommitVetVisits")}
        />

        <CheckboxOption
          label="I am willing to return the pet if unable to care for it"
          value={formData.willingToReturn}
          onPress={() => toggleCheckbox("willingToReturn")}
        />
      </View>

      {/* 5. Declarations */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkbox" size={20} color="#FD7E14" />
          <Text style={styles.sectionTitle}>5. Declarations & Agreements</Text>
        </View>

        <CheckboxOption
          label="I agree to spay/neuter the pet (if not yet done)"
          value={formData.agreeSpayNeuter}
          onPress={() => toggleCheckbox("agreeSpayNeuter")}
        />

        <CheckboxOption
          label="I agree not to resell, abandon, or harm the pet"
          value={formData.agreeNoAbandonment}
          onPress={() => toggleCheckbox("agreeNoAbandonment")}
        />

        <CheckboxOption
          label="I confirm all information provided is true *"
          value={formData.confirmInfoTruthful}
          onPress={() => toggleCheckbox("confirmInfoTruthful")}
        />

        <Text style={styles.signatureNote}>
          Signature will be collected during the interview process
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Application</Text>
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

const RadioOption = ({ label, selected, onPress }) => (
  <TouchableOpacity style={styles.radioOption} onPress={onPress}>
    <Ionicons
      name={selected ? "radio-button-on" : "radio-button-off"}
      size={20}
      color="#FD7E14"
    />
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const CheckboxOption = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <Ionicons
      name={value ? "checkbox" : "square-outline"}
      size={24}
      color={value ? "#FD7E14" : "#666"}
    />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
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
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  radioGroup: {
    flexDirection: "row",
    marginTop: 5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioLabel: {
    marginLeft: 5,
    fontSize: 16,
    color: "#333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  signatureNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
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
  // Upload ID styles
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
    padding: 10,
    borderWidth: 1,
    borderColor: "#FD7E14",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  uploadButtonText: {
    marginLeft: 5,
    color: "#FD7E14",
  },
  imagePreviewContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  idImagePreview: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  uploadSuccessText: {
    color: "green",
    fontSize: 12,
  },
  // Dropdown styles
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#888",
  },
  dropdownOptions: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AdoptionForm;
