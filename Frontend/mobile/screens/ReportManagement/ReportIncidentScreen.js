import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const ReportIncidentScreen = ({ navigation }) => {
  const [animalType, setAnimalType] = useState(null);
  const [petGender, setPetGender] = useState(null);
  const [images, setImages] = useState([]);
  const [reportType, setReportType] = useState(null);
  const [petBreed, setPetBreed] = useState("");
  const [petColor, setPetColor] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [petSize, setPetSize] = useState(null);
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera permissions are needed.");
      return;
    }

    Alert.alert(
      "Upload Image",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              aspect: [4, 3],
              quality: 0.6, // Compress to 60% - reduces file size significantly
              exif: false, // Remove metadata to reduce size
            });

            if (!result.canceled && result.assets) {
              const newImages = result.assets.map((asset) => asset.uri);
              setImages((prev) => [...prev, ...newImages]);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const galleryStatus =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (galleryStatus.status !== "granted") {
              Alert.alert(
                "Permission required",
                "Media library permission is needed."
              );
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              aspect: [4, 3],
              quality: 0.6, // Compress to 60% - reduces file size significantly
              exif: false, // Remove metadata to reduce size
              allowsMultipleSelection: true,
            });

            if (!result.canceled && result.assets) {
              const newImages = result.assets.map((asset) => asset.uri);
              setImages((prev) => [...prev, ...newImages]);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleNext = () => {
    // Validate all required fields
    const missingFields = [];
    
    if (!reportType) missingFields.push("Type of Report");
    if (!contactNumber || contactNumber.trim() === "") missingFields.push("Contact Number");
    if (!petColor || petColor.trim() === "") missingFields.push("Pet's Color");
    if (!petBreed || petBreed.trim() === "") missingFields.push("Pet's Breed");
    if (!animalType) missingFields.push("Type of Animal");
    if (!petGender) missingFields.push("Pet's Gender");
    if (!petSize) missingFields.push("Pet's Size");
    if (images.length === 0) missingFields.push("Upload Images (at least one)");
    if (!description || description.trim() === "") missingFields.push("Description");

    if (missingFields.length > 0) {
      Alert.alert(
        "Required Fields Missing",
        `Please fill in the following required fields:\n\n• ${missingFields.join("\n• ")}`
      );
      return;
    }

    // Validate contact number format
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(contactNumber.replace(/\s/g, ""))) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid Philippine mobile number (e.g., 09123456789)"
      );
      return;
    }

    navigation.navigate("LocationPicker", {
      reportData: {
        reportType,
        animalType,
        petGender,
        petSize,
        images,
        petBreed,
        petColor,
        contactNumber,
        date: date.toISOString(), // Convert to string to avoid serialization warning
        description,
      },
    });
  };

  const SelectionButton = ({ title, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.selectionButton, selected && styles.selectedButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.selectionButtonText,
          selected && styles.selectedButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Report Information</Text>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate("ReportStatus")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="history" size={27} color="#FD7E14" />
        </TouchableOpacity>
      </View>

      {/* Orange Divider */}
      <View style={styles.orangeDivider} />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* REPORT INFORMATION SECTION */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionGroupTitle}>Report Information</Text>

          {/* 1. Type of Report - Custom Dropdown */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Type of Report <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowReportTypeDropdown(!showReportTypeDropdown)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>
                {reportType === "incident"
                  ? "Incident/Bite Report"
                  : reportType === "stray"
                  ? "Stray Animal Report"
                  : reportType === "lost"
                  ? "Lost Pet Report"
                  : "Select report type"}
              </Text>
              <MaterialCommunityIcons
                name={showReportTypeDropdown ? "chevron-up" : "chevron-down"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {showReportTypeDropdown && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setReportType("incident");
                    setShowReportTypeDropdown(false);
                  }}
                >
                  <Text>Incident/Bite Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setReportType("stray");
                    setShowReportTypeDropdown(false);
                  }}
                >
                  <Text>Stray Animal Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setReportType("lost");
                    setShowReportTypeDropdown(false);
                  }}
                >
                  <Text>Lost Pet Report</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 2. Contact Number */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Contact Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 09438642023"
              placeholderTextColor="#999"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* 3. Date of Report */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Date of Incident <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* 4. Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Provide additional details about the report..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>

        {/* PET REPORT INFORMATION SECTION */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionGroupTitle}>Pet Report Information</Text>

          {/* 1. Pet's Color */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pet's Color <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Black"
              placeholderTextColor="#999"
              value={petColor}
              onChangeText={setPetColor}
            />
          </View>

          {/* 2. Pet's Breed */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pet's Breed <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Labrador, Aspin, etc."
              placeholderTextColor="#999"
              value={petBreed}
              onChangeText={setPetBreed}
            />
          </View>

          {/* 3. Type of Animal */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Type of Animal <Text style={styles.required}>*</Text></Text>
            <View style={styles.selectionRow}>
              <SelectionButton
                title="Dog"
                selected={animalType === "dog"}
                onPress={() => setAnimalType("dog")}
              />
              <SelectionButton
                title="Cat"
                selected={animalType === "cat"}
                onPress={() => setAnimalType("cat")}
              />
            </View>
          </View>

          {/* 4. Pet's Gender */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pet's Gender <Text style={styles.required}>*</Text></Text>
            <View style={styles.selectionRow}>
              <SelectionButton
                title="Male"
                selected={petGender === "male"}
                onPress={() => setPetGender("male")}
              />
              <SelectionButton
                title="Female"
                selected={petGender === "female"}
                onPress={() => setPetGender("female")}
              />
            </View>
          </View>

          {/* 5. Pet's Size */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pet's Size <Text style={styles.required}>*</Text></Text>
            <View style={styles.selectionRowTight}>
              <SelectionButton
                title="Small"
                selected={petSize === "small"}
                onPress={() => setPetSize("small")}
              />
              <SelectionButton
                title="Medium"
                selected={petSize === "medium"}
                onPress={() => setPetSize("medium")}
              />
              <SelectionButton
                title="Large"
                selected={petSize === "large"}
                onPress={() => setPetSize("large")}
              />
            </View>
          </View>

          {/* 6. Upload Images */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Upload Images <Text style={styles.required}>*</Text></Text>
            <Text style={styles.sectionSubtitle}>
              Tap to upload photos (Views of reported pet)
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Text style={styles.uploadButtonText}>Tap to upload photos</Text>
            </TouchableOpacity>
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { padding: 20, paddingBottom: 40 },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    marginTop: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  historyButton: {
    width: 45,
    height: 45,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  orangeDivider: {
    height: 2,
    backgroundColor: "#FD7E14",
    width: "91%",
    alignSelf: "center",
    marginBottom: 5,
  },
  sectionGroup: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  sectionGroupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  sectionContainer: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  required: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionSubtitle: { fontSize: 14, color: "#666", marginBottom: 10 },
  selectionRow: { flexDirection: "row", gap: 10 },
  selectionRowTight: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  selectionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#FD7E14",
    borderColor: "#FD7E14",
  },
  selectionButtonText: { color: "#000", fontSize: 14 },
  selectedButtonText: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  uploadButtonText: { color: "#666", fontSize: 14 },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
    borderRadius: 5,
    overflow: "hidden",
  },
  imagePreview: { width: "100%", height: "100%" },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#FD7E14",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dropdownButtonText: {
    color: "#000",
    fontSize: 14,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default ReportIncidentScreen;
