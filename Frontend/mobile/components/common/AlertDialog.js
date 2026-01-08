import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const AlertDialog = ({
  visible,
  onClose,
  title = "Alert",
  message = "",
  type = "info", // warning, success, info, danger
  buttonText = "OK",
}) => {
  const typeConfig = {
    warning: {
      icon: "warning",
      iconColor: "#D97706",
      iconBg: "#FEF3C7",
      buttonColor: "#D97706",
    },
    danger: {
      icon: "error",
      iconColor: "#DC2626",
      iconBg: "#FEE2E2",
      buttonColor: "#DC2626",
    },
    success: {
      icon: "check-circle",
      iconColor: "#059669",
      iconBg: "#D1FAE5",
      buttonColor: "#059669",
    },
    info: {
      icon: "info",
      iconColor: "#2563EB",
      iconBg: "#DBEAFE",
      buttonColor: "#2563EB",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View
              style={[styles.iconContainer, { backgroundColor: config.iconBg }]}
            >
              <MaterialIcons
                name={config.icon}
                size={32}
                color={config.iconColor}
              />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: config.buttonColor }]}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});

export default AlertDialog;
