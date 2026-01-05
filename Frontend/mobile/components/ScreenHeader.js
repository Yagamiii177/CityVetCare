import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BackButton from "./BackButton";

const ScreenHeader = ({ title }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    backgroundColor: "#F1F1F1",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    paddingTop: 90,
    paddingBottom: 15,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "black",
    textAlign: "center",
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  divider: {
    marginTop: 12,
    height: 3,
    backgroundColor: "#FD7E14",
    width: "93%",
    borderRadius: 2,
    marginBottom: 10,
  },
});

export default ScreenHeader;
