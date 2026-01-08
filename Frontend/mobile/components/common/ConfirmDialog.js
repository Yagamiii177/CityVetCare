import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ConfirmDialog = ({
  visible,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, success, info, danger
  isLoading = false,
}) => {
  const ORANGE = "#FD7E14";
  const ORANGE_BG = "#FFF7ED";

  // Keep type for icon only; visual design stays consistently orange.
  const typeIcon = {
    warning: "warning",
    danger: "error",
    success: "check-circle",
    info: "info",
  };

  const iconName = typeIcon[type] || typeIcon.warning;

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
              style={[styles.iconContainer, { backgroundColor: ORANGE_BG }]}
            >
              <MaterialIcons name={iconName} size={32} color={ORANGE} />
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={styles.closeButton}
            >
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
              disabled={isLoading}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: ORANGE },
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? "Loading..." : confirmText}
              </Text>
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
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});

export default ConfirmDialog;
