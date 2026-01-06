// screens/PetVaccinationManagement/PetVaccinationScreen.js
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import RegisterPet from "../../components/PetVaccinationManagement/RegisterPet";

const PetVaccinationScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <RegisterPet />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 0, // space for keyboard or bottom nav
  },
});

export default PetVaccinationScreen;
