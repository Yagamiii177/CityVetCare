import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const StrayFilterBar = ({ onFilter, activeFilter, onDateFilter }) => {
  const [showDateOptions, setShowDateOptions] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const isActive = (type) => activeFilter === type;

  const handleLocationPress = () => {
    Alert.alert(
      "Nearby Animals",
      "Showing stray animals within 5km of your current location",
      [
        {
          text: "OK",
          onPress: () => onFilter("nearby"),
        },
      ]
    );
  };

  const handleDateFilterSelect = (value) => {
    setDateFilter(value);
    onDateFilter(value);
    setShowDateOptions(false);
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    onDateFilter(null);
  };

  return (
    <View style={styles.container}>
      {/* Filter Row */}
      <View style={styles.filterRow}>
        {/* Date Picker */}
        <View style={styles.dateFilterWrapper}>
          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => setShowDateOptions(!showDateOptions)}
          >
            <Text style={styles.dateFilterText}>
              {dateFilter
                ? dateFilter === "today"
                  ? "Today"
                  : dateFilter === "week"
                  ? "Past Week"
                  : "Past Month"
                : "Date Filter"}
            </Text>
            <MaterialIcons
              name={showDateOptions ? "arrow-drop-up" : "arrow-drop-down"}
              size={20}
              color="#FA8630"
            />
          </TouchableOpacity>

          {dateFilter && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={clearDateFilter}
            >
              <Ionicons name="close" size={18} color="#FA8630" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dog */}
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

        {/* Cat */}
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
      </View>

      {/* Date Dropdown Options */}
      {showDateOptions && (
        <View style={styles.dateOptionsContainer}>
          <TouchableOpacity
            style={styles.dateOption}
            onPress={() => handleDateFilterSelect("today")}
          >
            <Text style={styles.dateOptionText}>Today</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.dateOption}
            onPress={() => handleDateFilterSelect("week")}
          >
            <Text style={styles.dateOptionText}>Past Week</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.dateOption}
            onPress={() => handleDateFilterSelect("month")}
          >
            <Text style={styles.dateOptionText}>Past Month</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
    right: 20,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateFilterWrapper: {
    flex: 1, // Take up available space
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // This will push icon to the right
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CECDCD",
    paddingHorizontal: 12,
    height: 40,
    marginRight: 8,
  },
  dateFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Align text and icon on opposite ends
    flex: 1, // Take up all available space
  },
  dateFilterText: {
    fontSize: 14,
    color: "#333",
  },
  clearDateButton: {
    marginLeft: 4,
    padding: 4,
  },
  squareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CECDCD",
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#FA8630",
    borderColor: "#FA8630",
  },
  dateOptionsContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CECDCD",
    paddingVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateOptionText: {
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 8,
  },
});

export default StrayFilterBar;
