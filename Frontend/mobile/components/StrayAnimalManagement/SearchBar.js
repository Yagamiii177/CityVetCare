import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const SearchBar = ({ value, onChange, onFilter, activeFilter }) => {
  const isActive = (type) => activeFilter === type;

  const handleClear = () => {
    onChange("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search by name or breed"
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#aaa"
        />
        {value !== "" && (
          <TouchableOpacity onPress={handleClear} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.squareButton,
            isActive("favorites") && styles.activeButton,
          ]}
          onPress={() => onFilter("favorites")}
        >
          <Ionicons
            name="heart"
            size={18}
            color={isActive("favorites") ? "#fff" : "#FA8630"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.squareButton, isActive("cat") && styles.activeButton]}
          onPress={() => onFilter("cat")}
        >
          <FontAwesome5
            name="cat"
            size={16}
            color={isActive("cat") ? "#fff" : "#FA8630"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.squareButton, isActive("dog") && styles.activeButton]}
          onPress={() => onFilter("dog")}
        >
          <FontAwesome5
            name="dog"
            size={16}
            color={isActive("dog") ? "#fff" : "#FA8630"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#CECDCD",
    paddingHorizontal: 12,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearIcon: {
    marginLeft: 8,
    padding: 1,
  },
  filters: {
    flexDirection: "row",
    gap: 6,
  },
  squareButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CECDCD",
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#FA8630",
  },
});

export default SearchBar;
