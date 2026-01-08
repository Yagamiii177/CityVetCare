import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BackButton from "./BackButton";

const ScreenHeader = ({
  title,
  showBackButton = false,
  rightContent = null,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.side}>
          {showBackButton ? <BackButton /> : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.right]}>{rightContent}</View>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    backgroundColor: "#F1F1F1",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  side: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  right: { alignItems: "flex-end" },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 3,
    backgroundColor: "#FD7E14",
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 8,
  },
});

export default ScreenHeader;
