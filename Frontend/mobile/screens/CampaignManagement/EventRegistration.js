import React, { useState } from "react";
import BackButton from "../../components/BackButton";
import ScreenHeader from "../../components/ScreenHeader";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

const barangays = [
  "Cararayan",
  "Carolina",
  "Del Rosario",
  "Igualdad",
  "Lerma",
  "Panicuason",
  "San Francisco",
  "San Isidro",
  "Sta. Cruz",
  "Abella",
].sort();

const EventRegistration = ({ route }) => {
  const { eventType } = route.params;
  const eventTitle =
    eventType === "vaccination"
      ? "Vaccination Registration"
      : "Castration Registration";

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    barangay: "",
    street: "",
    houseNumber: "",
    phone: "",
    email: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelect = (value) => {
    handleInputChange(currentField, value);
    setModalVisible(false);
  };

  const openDropdown = (field) => {
    setCurrentField(field);
    setModalVisible(true);
  };

  const handleGenderSelect = (gender) => {
    handleInputChange("gender", gender);
  };

  const handleSubmit = () => {
    // Add submission logic
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Participant Registration" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/** Text Input Fields */}
          {[
            {
              label: "Full Name",
              field: "fullName",
              placeholder: "Enter full name",
            },
            {
              label: "Age",
              field: "age",
              placeholder: "Enter age",
              keyboardType: "numeric",
            },
          ].map(({ label, field, placeholder, keyboardType }) => (
            <View key={field} style={styles.formGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={formData[field]}
                keyboardType={keyboardType || "default"}
                onChangeText={(text) => handleInputChange(field, text)}
              />
            </View>
          ))}

          {/** Gender Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === "Male" && styles.genderButtonSelected,
                ]}
                onPress={() => handleGenderSelect("Male")}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === "Male" &&
                      styles.genderButtonTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === "Female" && styles.genderButtonSelected,
                ]}
                onPress={() => handleGenderSelect("Female")}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === "Female" &&
                      styles.genderButtonTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/** Address Fields */}
          {[
            {
              label: "Street",
              field: "street",
              placeholder: "Enter street name",
            },
          ].map(({ label, field, placeholder, keyboardType }) => (
            <View key={field} style={styles.formGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={formData[field]}
                keyboardType={keyboardType || "default"}
                onChangeText={(text) => handleInputChange(field, text)}
              />
            </View>
          ))}

          {/** Dropdown Field for Barangay */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Barangay</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => openDropdown("barangay")}
            >
              <Text
                style={
                  formData.barangay
                    ? styles.dropdownText
                    : styles.dropdownPlaceholder
                }
              >
                {formData.barangay || "Select Barangay"}
              </Text>
            </TouchableOpacity>
          </View>

          {/** Contact Fields */}
          {[
            {
              label: "Contact Number",
              field: "phone",
              placeholder: "Enter your phone number",
              keyboardType: "phone-pad",
            },
            {
              label: "Email",
              field: "email",
              placeholder: "Enter your email",
              keyboardType: "email-address",
            },
          ].map(({ label, field, placeholder, keyboardType }) => (
            <View key={field} style={styles.formGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={formData[field]}
                keyboardType={keyboardType || "default"}
                onChangeText={(text) => handleInputChange(field, text)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

          {/* Dropdown Modal */}
          <Modal
            transparent
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <ScrollView>
                {currentField === "barangay" &&
                  barangays.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  dropdownInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#aaa",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  genderButton: {
    width: "48%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  genderButtonSelected: {
    backgroundColor: "#FD7E14",
    borderColor: "#FD7E14",
  },
  genderButtonText: {
    fontSize: 16,
    color: "#333",
  },
  genderButtonTextSelected: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#FD7E14",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 8,
    maxHeight: 320,
    paddingVertical: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default EventRegistration;
