import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomTabNavigator from "../../components/BottomNavigation";

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <Text>MAP</Text>
      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
