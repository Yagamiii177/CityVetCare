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
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const AnnouncementScreen = () => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Format date to display as "MMM DD, YYYY" (e.g., "Jun 02, 2023")
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Modified reading materials with dates and images
  const readingMaterials = [
    {
      id: 1,
      title: "House-To-House Anti-Rabies Vaccination for Dogs and Cats",
      content:
        "Rabies is a viral disease that affects the central nervous system of mammals, including humans. It is primarily transmitted through bites or scratches from infected animals, especially stray dogs and cats. The virus travels through the nerves to the brain, causing inflammation that is almost always fatal once symptoms appear. Prevention through vaccination is crucial for both pets and humans exposed to potentially rabid animals.",
      date: new Date(), // Today
      image: require("../../assets/CampaignManagement/image7.png"),
      eventDetails: "March 17-25, 2026 | Cararayan, Naga City", // Added event details
    },
    {
      id: 2,
      title: "Keeping Your Pets Indoors: A Key to Safety",
      content:
        "Keeping pets indoors is one of the best ways to protect them from diseases like rabies and other outdoor dangers. Indoor pets are less likely to encounter wild animals that may carry diseases, get into fights with other animals, or be exposed to toxins. They also face lower risks of traffic accidents and theft. While some pets need outdoor exercise, supervised outings or secure outdoor enclosures can provide safe alternatives to roaming freely.",
      date: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
      image: require("../../assets/CampaignManagement/image9.png"),
    },
    {
      id: 3,
      title: "Vaccination Schedule for Pets",
      content:
        "Regular vaccinations are essential for your pet's health. Puppies and kittens should start their vaccination series at 6-8 weeks of age, with boosters every 3-4 weeks until they are 16 weeks old. Adult pets need regular booster shots as recommended by your veterinarian. Core vaccines for dogs include rabies, distemper, parvovirus, and adenovirus. For cats, core vaccines are rabies, feline distemper, calicivirus, and herpesvirus.",
      date: new Date("2023-05-15"), // Past date
      image: require("../../assets/CampaignManagement/vaccination-schedule.jpg"),
    },
    {
      id: 4,
      title: "New Clinic Opening Hours",
      content:
        "Starting next week, our clinic will have extended hours on weekdays. We'll be open from 8:00 AM to 8:00 PM Monday through Friday, and 9:00 AM to 4:00 PM on Saturdays. Sunday hours remain 10:00 AM to 2:00 PM for emergencies only. Please schedule routine appointments during our extended weekday hours.",
      date: new Date(), // Today
      image: require("../../assets/CampaignManagement/Opening-hours.jpg"),
    },
  ];

  // Categorize posts by date
  const categorizePosts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayPosts = [];
    const yesterdayPosts = [];
    const pastPosts = [];

    readingMaterials.forEach((post) => {
      const postDate = new Date(post.date);
      postDate.setHours(0, 0, 0, 0);

      if (postDate.getTime() === today.getTime()) {
        todayPosts.push(post);
      } else if (postDate.getTime() === yesterday.getTime()) {
        yesterdayPosts.push(post);
      } else {
        pastPosts.push(post);
      }
    });

    return { todayPosts, yesterdayPosts, pastPosts };
  };

  const { todayPosts, yesterdayPosts, pastPosts } = categorizePosts();

  const renderSection = (title, posts) => {
    if (posts.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>{title}</Text>
        <View style={styles.sectionDivider} />
        {posts.map((material) => (
          <View key={material.id} style={styles.eventCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>{material.title}</Text>
              <Text style={styles.dateText}>{formatDate(material.date)}</Text>
            </View>
            <View style={styles.divider} />
            <Image
              source={material.image}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <Text
              style={styles.eventDescription}
              numberOfLines={expandedCards[material.id] ? undefined : 3}
              ellipsizeMode="tail"
            >
              {material.content}
            </Text>
            {expandedCards[material.id] && material.eventDetails && (
              <View style={styles.eventDetailsContainer}>
                <Text style={styles.eventDetailsText}>
                  {material.eventDetails}
                </Text>
              </View>
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
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <BackButton />
      <ScreenHeader title="Announcement" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderSection("Today", todayPosts)}
        {renderSection("Yesterday", yesterdayPosts)}
        {renderSection("Past Announcements", pastPosts)}
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#7f8c8d",
    marginBottom: 12,
    width: "100%",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    paddingRight: 10,
  },
  dateText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  eventDetailsContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  eventDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
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
    color: "#FD7E14",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AnnouncementScreen;
