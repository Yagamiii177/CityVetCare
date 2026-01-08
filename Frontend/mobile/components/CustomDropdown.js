import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomDropdown = ({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownButtonInner}>
          <Text
            style={[
              styles.dropdownButtonText,
              value === "" && styles.placeholderText,
            ]}
          >
            {selectedLabel}
          </Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#FD7E14"
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Select"}</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={true}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.6}
                >
                  <View style={styles.optionItemInner}>
                    <Text
                      style={[
                        styles.optionText,
                        value === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons name="checkmark" size={20} color="#FD7E14" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownButtonInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionItemInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  optionItemSelected: {
    backgroundColor: "#FFF5EB",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: "#FD7E14",
  },
});

export default CustomDropdown;
