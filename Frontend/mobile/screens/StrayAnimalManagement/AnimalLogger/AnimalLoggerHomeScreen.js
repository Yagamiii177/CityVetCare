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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Switch,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import LocationPickerModal from "../../../components/LocationPickerModal";
import CustomDropdown from "../../../components/CustomDropdown";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const RegisterStrayAnimalScreen = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [rfidStep, setRfidStep] = useState("prompt"); // prompt | rfidInput | form
  const [rfidStatus, setRfidStatus] = useState(null);
  const [rfidValue, setRfidValue] = useState("");
  const [isLoadingPetData, setIsLoadingPetData] = useState(false);
  const [petOwnerData, setPetOwnerData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [images, setImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
  });

  const [formData, setFormData] = useState({
    name: "", // Added optional name field
    breed: "",
    type: "dog",
    sex: "",
    isCastrated: false,
    color: "",
    markings: "",
    rfidCode: "",
    dateCaptured: new Date(),
    locationCaptured: "",
    latitude: null,
    longitude: null,
    registeredBy: user?.fullName || user?.full_name || "Admin",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [registrationDate] = useState(new Date());
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  // Pet registration (pet table)
  const [isPetRegisterVisible, setIsPetRegisterVisible] = useState(false);
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [petPhotoUri, setPetPhotoUri] = useState(null);
  const [petFormData, setPetFormData] = useState({
    ownerId: "",
    rfid: "",
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    sex: "",
    color: "",
    markings: "",
    status: "active",
  });

  const breedOptions = {
    Dog: [
      "Aspin",
      "Beagle",
      "Boxer",
      "Bulldog",
      "Chihuahua",
      "Dachshund",
      "German Shepherd",
      "Golden Retriever",
      "Great Dane",
      "Labrador Retriever",
      "Mixed Breed",
      "Other",
      "Poodle",
      "Rottweiler",
      "Shih Tzu",
      "Siberian Husky",
      "Yorkshire Terrier",
    ],
    Cat: [
      "Abyssinian",
      "Bengal",
      "British Shorthair",
      "Domestic Longhair",
      "Domestic Shorthair",
      "Maine Coon",
      "Mixed Breed",
      "Other",
      "Persian",
      "Ragdoll",
      "Russian Blue",
      "Scottish Fold",
      "Siamese",
      "Sphynx",
    ],
  };

  useEffect(() => {
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

  useEffect(() => {
    setRfidStep("prompt");
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Improved validation to handle whitespace-only inputs
    const requiredFields = [
      "name",
      "breed",
      "type",
      "sex",
      "color",
      "dateCaptured",
      "locationCaptured",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      Alert.alert(
        "Incomplete Form",
        `Please fill in: ${missingFields.join(", ")}`
      );
      return;
    }

    // Improved image validation
    const uploadedImages = Object.entries(images).filter(([, img]) => {
      return img && typeof img === "string" && img.trim() !== "";
    });

    if (uploadedImages.length === 0) {
      Alert.alert(
        "Images Required",
        "Please upload at least one image of the animal"
      );
      return;
    }

    const convertUriToDataUrl = async (uri) => {
      if (!uri || typeof uri !== "string" || uri.trim() === "") return null;
      try {
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        const sizeMb = info?.size ? info.size / (1024 * 1024) : 0;
        if (sizeMb > 3) {
          Alert.alert(
            "Image Too Large",
            "Please choose images under 3MB to submit."
          );
          return null;
        }
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
        // best-effort mime inference from extension
        const ext = uri.split(".").pop()?.toLowerCase();
        const mime = ext === "png" ? "image/png" : "image/jpeg";
        return `data:${mime};base64,${base64}`;
      } catch (err) {
        console.warn("Failed to convert image to base64", err);
        return null;
      }
    };

    const imagesPayloadEntries = await Promise.all(
      uploadedImages.map(async ([key, uri]) => {
        const dataUrl = await convertUriToDataUrl(uri);
        return dataUrl ? [key, dataUrl] : null;
      })
    );

    const imagesPayload = Object.fromEntries(
      imagesPayloadEntries.filter(Boolean)
    );

    if (!Object.keys(imagesPayload).length) {
      Alert.alert(
        "Image Upload",
        "Selected images could not be processed. Please try again."
      );
      return;
    }

    const formattedDateCaptured =
      formData.dateCaptured instanceof Date
        ? formData.dateCaptured.toISOString().split("T")[0]
        : formData.dateCaptured;

    const payload = {
      rfid: formData.rfidCode ? formData.rfidCode.trim() : null,
      name: formData.name ? formData.name.trim() : null,
      species:
        formData.type === "cat"
          ? "Cat"
          : formData.type === "dog"
          ? "Dog"
          : formData.type,
      breed: formData.breed,
      sex: formData.sex,
      color: formData.color,
      markings: formData.markings || null,
      sprayedNeutered: formData.isCastrated,
      dateCaptured: formattedDateCaptured,
      registrationDate: registrationDate.toISOString().split("T")[0],
      locationCaptured: formData.locationCaptured,
      latitude: formData.latitude,
      longitude: formData.longitude,
      registeredBy: formData.registeredBy,
      images: imagesPayload,
    };

    setPendingPayload(payload);
    setConfirmSubmit(true);
  };

  const handlePetChange = (key, value) => {
    setPetFormData((prev) => ({ ...prev, [key]: value }));
  };

  const pickPetPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });
      if (!result.canceled) {
        setPetPhotoUri(result.assets?.[0]?.uri ?? null);
      }
    } catch (err) {
      console.warn("Pet photo picker failed", err);
    }
  };

  const takePetPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera access to take photos"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        setPetPhotoUri(result.assets?.[0]?.uri ?? null);
      }
    } catch (err) {
      console.warn("Pet camera capture failed", err);
    }
  };

  const convertUriToDataUrlForPet = async (uri) => {
    if (!uri || typeof uri !== "string" || uri.trim() === "") return null;
    try {
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      const sizeMb = info?.size ? info.size / (1024 * 1024) : 0;
      if (sizeMb > 3) {
        Alert.alert("Image Too Large", "Please choose an image under 3MB.");
        return null;
      }
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      const ext = uri.split(".").pop()?.toLowerCase();
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${base64}`;
    } catch (err) {
      console.warn("Failed to convert pet photo to base64", err);
      return null;
    }
  };

  const registerPet = async () => {
    if (isSubmittingPet) return;

    const ownerIdRaw = petFormData.ownerId?.toString().trim();
    const ownerId = ownerIdRaw ? Number(ownerIdRaw) : NaN;
    if (!ownerIdRaw || Number.isNaN(ownerId)) {
      Alert.alert("Owner Required", "Please enter a valid Owner ID.");
      return;
    }

    if (!petFormData.name || petFormData.name.toString().trim() === "") {
      Alert.alert("Name Required", "Please enter the pet name.");
      return;
    }

    if (!petFormData.species || petFormData.species.toString().trim() === "") {
      Alert.alert("Species Required", "Please select a species.");
      return;
    }

    const rfidTrimmed = petFormData.rfid
      ? petFormData.rfid.toString().trim()
      : "";
    if (rfidTrimmed && !/^\d{9}$/.test(rfidTrimmed)) {
      Alert.alert("Invalid RFID", "RFID must be exactly 9 digits.");
      return;
    }

    if (!petPhotoUri) {
      Alert.alert("Photo Required", "Please add a pet photo.");
      return;
    }

    const photoDataUrl = await convertUriToDataUrlForPet(petPhotoUri);
    if (!photoDataUrl) {
      Alert.alert("Photo Error", "Unable to process the selected photo.");
      return;
    }

    const ageRaw = petFormData.age?.toString().trim();
    const ageValue = ageRaw ? Number(ageRaw) : null;
    if (ageValue !== null && (Number.isNaN(ageValue) || ageValue < 0)) {
      Alert.alert("Invalid Age", "Age must be a non-negative number.");
      return;
    }

    const payload = {
      owner_id: ownerId,
      rfid: rfidTrimmed || null,
      name: petFormData.name.toString().trim(),
      species: petFormData.species.toString().trim(),
      breed: petFormData.breed ? petFormData.breed.toString().trim() : null,
      age: ageValue,
      sex: petFormData.sex ? petFormData.sex.toString().trim() : null,
      color: petFormData.color ? petFormData.color.toString().trim() : null,
      markings: petFormData.markings
        ? petFormData.markings.toString().trim()
        : null,
      photo: photoDataUrl,
      status: petFormData.status
        ? petFormData.status.toString().trim()
        : "active",
    };

    setIsSubmittingPet(true);
    try {
      await api.pets.create(payload);
      Alert.alert(
        "Pet Registered",
        "The pet has been registered successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsPetRegisterVisible(false);
              setPetPhotoUri(null);
              setPetFormData({
                ownerId: "",
                rfid: "",
                name: "",
                species: "Dog",
                breed: "",
                age: "",
                sex: "",
                color: "",
                markings: "",
                status: "active",
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error registering pet:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Unable to register pet right now."
      );
    } finally {
      setIsSubmittingPet(false);
    }
  };

  const confirmRegistration = async () => {
    if (!pendingPayload) return;

    setConfirmSubmit(false);
    setIsSubmitting(true);

    try {
      await api.strayAnimals.create(pendingPayload);

      Alert.alert(
        "Registration Submitted",
        "The stray animal has been successfully registered!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error registering stray animal:", error);
      Alert.alert(
        "Submission Failed",
        error.message || "Unable to register stray animal right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      locationCaptured: locationData.address,
      latitude: locationData.latitude ?? null,
      longitude: locationData.longitude ?? null,
    });
  };

  const pickImage = async (angle) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImages({ ...images, [angle]: result.assets[0].uri });
      }
    } catch (err) {
      console.warn("Image picker failed", err);
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

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        setImages({ ...images, [angle]: result.assets[0].uri });
      }
    } catch (err) {
      console.warn("Camera capture failed", err);
    }
  };

  const removeImage = (angle) => {
    setImages({ ...images, [angle]: null });
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "ios") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      handleChange("dateCaptured", selectedDate);
    }

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  const fetchPetByRfid = async (rfid) => {
    setIsLoadingPetData(true);
    try {
      const response = await api.pets.getByRfid(rfid.trim());

      if (response && response.pet) {
        const pet = response.pet;
        const owner = response.owner || null;

        const normalizedType = (() => {
          const raw = pet?.species
            ? String(pet.species).trim().toLowerCase()
            : "";
          if (raw === "dog") return "dog";
          if (raw === "cat") return "cat";
          return pet?.species || "dog";
        })();

        // Pre-populate form with pet data using functional update
        setFormData((prev) => ({
          ...prev,
          name: pet.name || "",
          breed: pet.breed || "",
          type: normalizedType,
          sex: pet.sex || "",
          color: pet.color || "",
          markings: pet.markings || pet.marking || "",
          rfidCode: rfid.trim(),
        }));

        // Store owner data to display
        setPetOwnerData(owner);

        // Move to form step
        setRfidStep("form");
      } else {
        Alert.alert(
          "Pet Not Found",
          "No pet found with this RFID. Please check and try again."
        );
        setRfidValue("");
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to retrieve pet data. Please try again."
      );
      setRfidValue("");
    } finally {
      setIsLoadingPetData(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <Modal
            visible={rfidStep === "prompt"}
            animationType="fade"
            presentationStyle="fullScreen"
            statusBarTranslucent={false}
            onRequestClose={() => {
              setRfidStep("prompt");
              navigation.replace("VetHome");
            }}
          >
            <View style={styles.modalFullScreen}>
              <View style={styles.modalCardWide}>
                <View style={styles.modalIconBadge}>
                  <Ionicons name="radio-outline" size={28} color="#FD7E14" />
                </View>
                <Text style={styles.modalTitle}>Does the pet have RFID?</Text>
                <Text style={styles.modalSubtitle}>
                  Choose how you want to log this animal
                </Text>
                <View style={styles.modalButtonsStack}>
                  <TouchableOpacity
                    style={[styles.modalButtonBig, styles.modalButtonPrimary]}
                    onPress={() => {
                      setRfidStatus("hasRFID");
                      setRfidStep("rfidInput");
                    }}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="checkbox-outline"
                        size={24}
                        color="#fff"
                      />
                      <Text style={styles.modalButtonBigText}>
                        Pet Has RFID
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButtonBig, styles.modalButtonSecondary]}
                    onPress={() => {
                      setRfidStatus("noRFID");
                      setRfidStep("form");
                    }}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="close-circle-outline"
                        size={24}
                        color="#FD7E14"
                      />
                      <Text style={styles.modalButtonBigTextSecondary}>
                        Pet Has No RFID
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButtonBig, styles.modalButtonSecondary]}
                    onPress={() => {
                      setRfidStep("prompt");
                      navigation.replace("VetHome");
                    }}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="arrow-back-outline"
                        size={22}
                        color="#FD7E14"
                      />
                      <Text style={styles.modalButtonBigTextSecondary}>
                        Back
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={isPetRegisterVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setIsPetRegisterVisible(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setIsPetRegisterVisible(false)}
            >
              <View style={styles.petRegisterOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.petRegisterCard}>
                    <View style={styles.petRegisterHeader}>
                      <View style={styles.buttonRow}>
                        <Ionicons
                          name="paw-outline"
                          size={20}
                          color="#FD7E14"
                        />
                        <Text style={styles.petRegisterTitle}>
                          Register Pet
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setIsPetRegisterVisible(false)}
                      >
                        <Ionicons name="close" size={22} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      style={{ maxHeight: 520 }}
                      contentContainerStyle={{ paddingBottom: 8 }}
                      keyboardShouldPersistTaps="handled"
                    >
                      <FormInput
                        label="Owner ID *"
                        value={petFormData.ownerId}
                        onChangeText={(t) => handlePetChange("ownerId", t)}
                        placeholder="e.g. 12"
                        keyboardType="numeric"
                      />

                      <FormInput
                        label="RFID (9 digits)"
                        value={petFormData.rfid}
                        onChangeText={(t) => handlePetChange("rfid", t)}
                        placeholder="Optional"
                        keyboardType="numeric"
                      />

                      <FormInput
                        label="Name *"
                        value={petFormData.name}
                        onChangeText={(t) => handlePetChange("name", t)}
                        placeholder="Pet name"
                      />

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Species *</Text>
                        <View style={styles.typeButtonsContainer}>
                          <TouchableOpacity
                            style={[
                              styles.typeButton,
                              petFormData.species === "Dog" &&
                                styles.typeButtonActive,
                            ]}
                            onPress={() => handlePetChange("species", "Dog")}
                          >
                            <View style={styles.buttonRow}>
                              <Ionicons
                                name="paw-outline"
                                size={24}
                                color={
                                  petFormData.species === "Dog"
                                    ? "#fff"
                                    : "#FD7E14"
                                }
                              />
                              <Text
                                style={[
                                  styles.typeButtonText,
                                  petFormData.species === "Dog" &&
                                    styles.typeButtonTextActive,
                                ]}
                              >
                                Dog
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.typeButton,
                              petFormData.species === "Cat" &&
                                styles.typeButtonActive,
                            ]}
                            onPress={() => handlePetChange("species", "Cat")}
                          >
                            <View style={styles.buttonRow}>
                              <Ionicons
                                name="paw-outline"
                                size={24}
                                color={
                                  petFormData.species === "Cat"
                                    ? "#fff"
                                    : "#FD7E14"
                                }
                              />
                              <Text
                                style={[
                                  styles.typeButtonText,
                                  petFormData.species === "Cat" &&
                                    styles.typeButtonTextActive,
                                ]}
                              >
                                Cat
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <FormInput
                        label="Breed"
                        value={petFormData.breed}
                        onChangeText={(t) => handlePetChange("breed", t)}
                        placeholder="Optional"
                      />

                      <FormInput
                        label="Age"
                        value={petFormData.age}
                        onChangeText={(t) => handlePetChange("age", t)}
                        placeholder="Optional"
                        keyboardType="numeric"
                      />

                      <FormInput
                        label="Sex"
                        value={petFormData.sex}
                        onChangeText={(t) => handlePetChange("sex", t)}
                        placeholder="Optional (male/female)"
                      />

                      <FormInput
                        label="Color"
                        value={petFormData.color}
                        onChangeText={(t) => handlePetChange("color", t)}
                        placeholder="Optional"
                      />

                      <FormInput
                        label="Markings"
                        value={petFormData.markings}
                        onChangeText={(t) => handlePetChange("markings", t)}
                        placeholder="Optional"
                      />

                      <FormInput
                        label="Status"
                        value={petFormData.status}
                        onChangeText={(t) => handlePetChange("status", t)}
                        placeholder="active"
                      />

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Photo *</Text>
                        {petPhotoUri ? (
                          <View style={styles.petPhotoPreviewWrap}>
                            <Image
                              source={{ uri: petPhotoUri }}
                              style={styles.petPhotoPreview}
                            />
                            <TouchableOpacity
                              style={styles.petPhotoRemove}
                              onPress={() => setPetPhotoUri(null)}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#fff"
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.petPhotoButtonsRow}>
                            <TouchableOpacity
                              style={styles.petPhotoButton}
                              onPress={pickPetPhoto}
                            >
                              <View style={styles.buttonRow}>
                                <Ionicons
                                  name="image-outline"
                                  size={18}
                                  color="#FD7E14"
                                />
                                <Text style={styles.petPhotoButtonText}>
                                  Choose Photo
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.petPhotoButton}
                              onPress={takePetPhoto}
                            >
                              <View style={styles.buttonRow}>
                                <Ionicons
                                  name="camera-outline"
                                  size={18}
                                  color="#FD7E14"
                                />
                                <Text style={styles.petPhotoButtonText}>
                                  Take Photo
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </ScrollView>

                    <View style={styles.petRegisterFooter}>
                      <TouchableOpacity
                        style={[
                          styles.modalButtonBig,
                          styles.modalButtonSecondary,
                        ]}
                        onPress={() => setIsPetRegisterVisible(false)}
                        disabled={isSubmittingPet}
                      >
                        <View style={styles.buttonRow}>
                          <Ionicons
                            name="close-circle-outline"
                            size={22}
                            color="#FD7E14"
                          />
                          <Text style={styles.modalButtonBigTextSecondary}>
                            Cancel
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButtonBig,
                          styles.modalButtonPrimary,
                        ]}
                        onPress={registerPet}
                        disabled={isSubmittingPet}
                      >
                        {isSubmittingPet ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <View style={styles.buttonRow}>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={22}
                              color="#fff"
                            />
                            <Text style={styles.modalButtonBigText}>
                              Register
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Modal
            visible={rfidStep === "rfidInput"}
            animationType="fade"
            presentationStyle="fullScreen"
            statusBarTranslucent={false}
            onRequestClose={() => setRfidStep("prompt")}
          >
            <View style={styles.modalFullScreen}>
              <View style={styles.modalCardWide}>
                <View style={styles.modalIconBadge}>
                  <Ionicons name="key-outline" size={28} color="#FD7E14" />
                </View>
                <Text style={styles.modalTitle}>Enter RFID Code</Text>
                <Text style={styles.modalSubtitle}>
                  Scan or type the RFID before proceeding
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="RFID code"
                  value={rfidValue}
                  onChangeText={setRfidValue}
                  autoFocus
                />
                <View style={styles.modalButtonsStack}>
                  <TouchableOpacity
                    style={[styles.modalButtonBig, styles.modalButtonPrimary]}
                    onPress={() => {
                      if (!rfidValue.trim()) {
                        Alert.alert(
                          "RFID Required",
                          "Please enter an RFID code to continue."
                        );
                        return;
                      }
                      fetchPetByRfid(rfidValue);
                    }}
                    disabled={isLoadingPetData}
                  >
                    {isLoadingPetData ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <View style={styles.buttonRow}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={24}
                          color="#fff"
                        />
                        <Text style={styles.modalButtonBigText}>Continue</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButtonBig, styles.modalButtonSecondary]}
                    onPress={() => {
                      setRfidStep("prompt");
                    }}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="arrow-back-outline"
                        size={22}
                        color="#FD7E14"
                      />
                      <Text style={styles.modalButtonBigTextSecondary}>
                        Back
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            contentInsetAdjustmentBehavior="always"
          >
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  onPress={() => {
                    setRfidStep("prompt");
                    setPetOwnerData(null);
                    navigation.replace("VetHome");
                  }}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={24}
                    color="#FD7E14"
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register Stray Animal</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={styles.orangeDivider} />
            </View>

            {/* Pet Owner Information */}
            {petOwnerData && (
              <View style={styles.petOwnerCard}>
                <View style={styles.petOwnerHeader}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="#FD7E14"
                  />
                  <Text style={styles.petOwnerTitle}>
                    Pet Owner Information
                  </Text>
                </View>
                <View style={styles.petOwnerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Owner Name:</Text>
                    <Text style={styles.detailValue}>
                      {petOwnerData.full_name}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{petOwnerData.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>
                      {petOwnerData.contact_number}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue}>
                      {petOwnerData.address}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Animal Information Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="paw-outline" size={20} color="#FD7E14" />
                <Text style={styles.sectionTitle}>Animal Information</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Basic details about the stray animal
              </Text>

              {/* Name Field (Required) */}
              <FormInput
                label="Name *"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="If the animal has a known name"
              />

              {/* Breed Dropdown (matches web options) */}
              <View style={styles.formGroup}>
                <CustomDropdown
                  label="Breed *"
                  value={formData.breed}
                  options={[
                    { label: "Select breed", value: "" },
                    ...(formData.type === "cat"
                      ? breedOptions.Cat
                      : breedOptions.Dog
                    ).map((b) => ({ label: b, value: b })),
                  ]}
                  onSelect={(val) => handleChange("breed", val)}
                  placeholder="Select breed"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type *</Text>
                <View style={styles.typeButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === "dog" && styles.typeButtonActive,
                    ]}
                    onPress={() => handleChange("type", "dog")}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="paw-outline"
                        size={24}
                        color={formData.type === "dog" ? "#fff" : "#FD7E14"}
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.type === "dog" &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        Dog
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === "cat" && styles.typeButtonActive,
                    ]}
                    onPress={() => handleChange("type", "cat")}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="paw-outline"
                        size={24}
                        color={formData.type === "cat" ? "#fff" : "#FD7E14"}
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          formData.type === "cat" &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        Cat
                      </Text>
                    </View>
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
                    onPress={() => handleChange("sex", "male")}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="male-outline"
                        size={24}
                        color={formData.sex === "male" ? "#fff" : "#FD7E14"}
                      />
                      <Text
                        style={[
                          styles.sexButtonText,
                          formData.sex === "male" && styles.sexButtonTextActive,
                        ]}
                      >
                        Male
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sexButton,
                      formData.sex === "female" && styles.sexButtonActive,
                    ]}
                    onPress={() => handleChange("sex", "female")}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons
                        name="female-outline"
                        size={24}
                        color={formData.sex === "female" ? "#fff" : "#FD7E14"}
                      />
                      <Text
                        style={[
                          styles.sexButtonText,
                          formData.sex === "female" &&
                            styles.sexButtonTextActive,
                        ]}
                      >
                        Female
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {formData.sex && (
                  <View style={styles.castratedContainer}>
                    <Switch
                      value={formData.isCastrated}
                      onValueChange={(value) =>
                        handleChange("isCastrated", value)
                      }
                      thumbColor={formData.isCastrated ? "#FD7E14" : "#f4f3f4"}
                      trackColor={{ false: "#767577", true: "#FD7E1477" }}
                    />
                    <Text style={styles.castratedText}>Castrated/Spayed</Text>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Color *</Text>
                <View style={styles.colorPickerContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.colorScrollView}
                  >
                    {[
                      { name: "Black", hex: "#1a1a1a" },
                      { name: "White", hex: "#f5f5f5" },
                      { name: "Brown", hex: "#8B4513" },
                      { name: "Tan/Fawn", hex: "#D2B48C" },
                      { name: "Cream", hex: "#FFFDD0" },
                      { name: "Gray/Silver", hex: "#A9A9A9" },
                      { name: "Orange/Ginger", hex: "#D2691E" },
                      { name: "Black & White", hex: "#4B4B4B" },
                      { name: "Brown & White", hex: "#C4A484" },
                      { name: "Brindle", hex: "#6B4423" },
                      { name: "Merle", hex: "#708090" },
                      { name: "Tabby/Striped", hex: "#B8860B" },
                      { name: "Tortoiseshell/Calico", hex: "#C25A3A" },
                      { name: "Tri-color", hex: "#8B7355" },
                    ].map((colorOption) => (
                      <TouchableOpacity
                        key={colorOption.name}
                        style={[
                          styles.colorOptionWrapper,
                          formData.color === colorOption.name &&
                            styles.colorOptionWrapperActive,
                        ]}
                        onPress={() => handleChange("color", colorOption.name)}
                      >
                        <View style={styles.buttonRow}>
                          <View
                            style={[
                              styles.colorDot,
                              { backgroundColor: colorOption.hex },
                              colorOption.name === "White" &&
                                styles.colorDotWhite,
                            ]}
                          />
                          <Text
                            style={[
                              styles.colorLabel,
                              formData.color === colorOption.name &&
                                styles.colorLabelActive,
                            ]}
                          >
                            {colorOption.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <FormInput
                label="Markings"
                value={formData.markings}
                onChangeText={(text) => handleChange("markings", text)}
                placeholder="Distinctive markings or features"
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date Captured *</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.buttonRow}>
                    <Text>{formData.dateCaptured.toLocaleDateString()}</Text>
                    <Ionicons name="calendar" size={20} color="#FD7E14" />
                  </View>
                </TouchableOpacity>
                {Platform.OS === "ios" ? (
                  showDatePicker && (
                    <DateTimePicker
                      value={formData.dateCaptured}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      minimumDate={new Date(2000, 0, 1)}
                      maximumDate={new Date()}
                    />
                  )
                ) : showDatePicker ? (
                  <DateTimePicker
                    value={formData.dateCaptured}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date(2000, 0, 1)}
                    maximumDate={new Date()}
                  />
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Registration Date</Text>
                <View style={styles.dateInput}>
                  <Text>{registrationDate.toLocaleDateString()}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location Captured *</Text>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={[styles.input, styles.locationInput]}
                    value={formData.locationCaptured}
                    onChangeText={(text) =>
                      handleChange("locationCaptured", text)
                    }
                    placeholder="Where the animal was found"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setIsLocationPickerVisible(true)}
                  >
                    <View style={styles.buttonRow}>
                      <Ionicons name="location" size={20} color="#FFF" />
                      <Text style={styles.mapButtonText}>Open Map</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <FormInput
                label="Registered By"
                value={formData.registeredBy}
                editable={false}
                style={{ backgroundColor: "#f5f5f5" }}
                placeholder="Administrator name"
              />
            </View>

            {/* Animal Images Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="camera-outline" size={20} color="#FD7E14" />
                <Text style={styles.sectionTitle}>Animal Images</Text>
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
                          onPress={() => pickImage(angle)}
                        >
                          <Text style={styles.imageButtonText}>Change</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.imageActionButton}
                          onPress={() => removeImage(angle)}
                        >
                          <Text style={styles.imageButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadOptions}>
                      <TouchableOpacity
                        style={styles.uploadOptionButton}
                        onPress={() => pickImage(angle)}
                      >
                        <View style={styles.buttonRow}>
                          <Ionicons name="image" size={20} color="#FD7E14" />
                          <Text style={styles.uploadOptionText}>
                            Choose Photo
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.uploadOptionButton}
                        onPress={() => takePhoto(angle)}
                      >
                        <View style={styles.buttonRow}>
                          <Ionicons name="camera" size={20} color="#FD7E14" />
                          <Text style={styles.uploadOptionText}>
                            Take Photo
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Register Animal</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={isLocationPickerVisible}
        onClose={() => setIsLocationPickerVisible(false)}
        onSelectLocation={handleLocationSelect}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={confirmRegistration}
        title="Confirm Registration"
        message={`Are you sure you want to register ${
          formData.name || "this stray animal"
        }? Please verify all information is correct before proceeding.`}
        confirmText="Register"
        cancelText="Cancel"
        type="info"
        isLoading={isSubmitting}
      />
    </KeyboardAvoidingView>
  );
};

const FormInput = ({ label, onSubmitEditing, ...props }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      {...props}
      returnKeyType="next"
      blurOnSubmit={false}
      onSubmitEditing={onSubmitEditing}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
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

    petRegisterOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 16,
    },
    petRegisterCard: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
    },
    petRegisterHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      marginBottom: 12,
    },
    petRegisterTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#333",
      marginLeft: 8,
    },
    petRegisterFooter: {
      marginTop: 10,
      gap: 10,
    },
    petPhotoButtonsRow: {
      flexDirection: "row",
      gap: 10,
    },
    petPhotoButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#FD7E14",
      backgroundColor: "#FFF5EC",
      justifyContent: "center",
    },
    petPhotoButtonText: {
      color: "#FD7E14",
      fontWeight: "700",
      marginLeft: 8,
    },
    petPhotoPreviewWrap: {
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#eee",
    },
    petPhotoPreview: {
      width: "100%",
      height: 180,
    },
    petPhotoRemove: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "rgba(253,126,20,0.9)",
      borderRadius: 16,
      padding: 8,
    },
    marginTop: 15,
  },
  petOwnerCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#FFF9F3",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FD7E14",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  petOwnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  petOwnerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  petOwnerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    flex: 0.4,
  },
  detailValue: {
    fontSize: 13,
    color: "#333",
    flex: 0.6,
    textAlign: "right",
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
  colorPickerContainer: {
    marginTop: 8,
  },
  colorScrollView: {
    flexGrow: 0,
  },
  colorOptionWrapper: {
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 8,
  },
  colorOptionWrapperActive: {
    opacity: 1,
  },
  colorDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 6,
  },
  colorDotWhite: {
    borderColor: "#999",
    borderWidth: 2,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  colorLabelActive: {
    color: "#FD7E14",
    fontWeight: "700",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
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
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: "#FFF6EE",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  modalCardWide: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  modalButtonLogout: {
    borderColor: "#dc3545",
    marginBottom: 0,
  },
  modalButtonLogoutText: {
    marginLeft: 10,
    fontWeight: "700",
    fontSize: 17,
    color: "#dc3545",
  },
  modalIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FD7E1420",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  modalButtonsStack: {
    flexDirection: "column",
  },
  modalButtonBig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FD7E14",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  modalButtonPrimary: {
    backgroundColor: "#FD7E14",
  },
  modalButtonSecondary: {
    backgroundColor: "#fff",
  },
  modalButtonBigText: {
    marginLeft: 10,
    fontWeight: "700",
    fontSize: 17,
    color: "#fff",
  },
  modalButtonBigTextSecondary: {
    marginLeft: 10,
    fontWeight: "700",
    fontSize: 17,
    color: "#FD7E14",
  },
  locationInputContainer: {
    flexDirection: "column",
    gap: 10,
  },
  locationInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FA8630",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  mapButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  picker: {
    height: 48,
  },
});

export default RegisterStrayAnimalScreen;
