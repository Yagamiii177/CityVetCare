import React, { useState } from "react";
import BackButton from "../../components/BackButton";
import ScreenHeader from "../../components/ScreenHeader";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
} from "react-native";

const { width } = Dimensions.get("window");

const ReadingMaterialListScreen = () => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() => {
      // Could show user-friendly error here
    });
  };

  const readingMaterials = [
    {
      id: 1,
      title: "Understanding Rabies: A Deadly but Preventable Disease",
      content:
        "Rabies is a viral disease that affects the central nervous system of mammals, including humans. It is primarily transmitted through bites or scratches from infected animals, especially stray dogs and cats. The virus travels through the nerves to the brain, causing inflammation that is almost always fatal once symptoms appear. Prevention through vaccination is crucial for both pets and humans exposed to potentially rabid animals.",
      link: "https://www.who.int/news-room/fact-sheets/detail/rabies",
      linkText: "Learn more about rabies prevention from WHO",
    },
    {
      id: 2,
      title: "Keeping Your Pets Indoors: A Key to Safety",
      content:
        "Keeping pets indoors is one of the best ways to protect them from diseases like rabies and other outdoor dangers. Indoor pets are less likely to encounter wild animals that may carry diseases, get into fights with other animals, or be exposed to toxins. They also face lower risks of traffic accidents and theft. While some pets need outdoor exercise, supervised outings or secure outdoor enclosures can provide safe alternatives to roaming freely.",
      link: "https://www.aspca.org/pet-care/general-pet-care/indoor-cats",
      linkText: "ASPCA guide to keeping pets indoors safely",
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Reading Materials" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {readingMaterials.map((material) => (
          <View key={material.id} style={styles.eventCard}>
            <Text style={styles.sectionTitle}>{material.title}</Text>
            <View style={styles.divider} />
            <Text
              style={styles.eventDescription}
              numberOfLines={expandedCards[material.id] ? undefined : 3}
              ellipsizeMode="tail"
            >
              {material.content}
            </Text>

            {/* Show link only when expanded */}
            {expandedCards[material.id] && material.link && (
              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => handleLinkPress(material.link)}
              >
                <Text style={styles.linkText}>{material.linkText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => toggleExpand(material.id)}
            >
              <Text style={styles.seeMoreText}>
                {expandedCards[material.id] ? "See Less" : "See More"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  eventCard: {
    width: width - 32,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
    width: "100%",
  },
  seeMoreButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  seeMoreText: {
    color: "#e67e22",
    fontSize: 14,
    fontWeight: "600",
  },
  linkContainer: {
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#e67e22",
  },
  linkText: {
    color: "#2980b9",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default ReadingMaterialListScreen;
