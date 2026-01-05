import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");

const AnimalProfileScreen = ({ route }) => {
  const { pet } = route.params;
  const navigation = useNavigation();
  const petName = pet.name?.trim() !== "" ? pet.name : "Unnamed";
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [currentZoomImage, setCurrentZoomImage] = useState(null);

  // Corrected image handling logic
  const getImages = () => {
    if (pet.imagesUrls?.length > 0) return pet.imagesUrls;
    if (Array.isArray(pet.imageUrls) && pet.imageUrls.length > 0)
      return pet.imageUrls;
    if (typeof pet.imageUrls === "string") return [pet.imageUrls];
    return [require("../../assets/icons/logo.png")];
  };

  const images = getImages();

  const displayValue = (value) => value || "N/A";

  const handleAdoptPress = () => {
    navigation.navigate("AdoptionForm", { pet });
  };

  const openImageZoom = (image) => {
    setCurrentZoomImage(image);
    setZoomVisible(true);
  };

  const closeImageZoom = () => {
    setZoomVisible(false);
  };

  const renderImageItem = ({ item }) => {
    const source = typeof item === "string" ? { uri: item } : item;

    return (
      <TouchableWithoutFeedback onPress={() => openImageZoom(item)}>
        <View style={styles.imageContainer}>
          <Image source={source} style={styles.image} resizeMode="fill" />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (screenWidth - 20)
              );
              setActiveIndex(index);
            }}
          />

          {/* Image Pagination */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Pet Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.name}>
            <Ionicons name="paw" size={20} color="#FA8630" /> {petName}
          </Text>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="pets" size={18} color="#FA8630" /> Basic
              Information
            </Text>
            <DetailRow
              icon="pets"
              label="Breed"
              value={displayValue(pet.breed)}
            />
            <DetailRow
              icon={pet.sex === "Male" ? "male" : "female"}
              label="Sex"
              value={displayValue(pet.sex)}
            />
            <DetailRow
              icon="date-range"
              label="Age"
              value={displayValue(pet.age)}
            />
            <DetailRow icon="tag" label="Type" value={displayValue(pet.type)} />
            <DetailRow
              icon="palette"
              label="Color"
              value={displayValue(pet.color)}
            />
            <DetailRow
              icon="brush"
              label="Markings"
              value={displayValue(pet.markings)}
            />
          </View>

          {/* Capture Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="place" size={18} color="#FA8630" /> Capture
              Information
            </Text>
            <DetailRow
              icon="date-range"
              label="Date Captured"
              value={displayValue(pet.capturedDate)}
            />
            <DetailRow
              icon="location-on"
              label="Location"
              value={displayValue(pet.capturedLocation)}
            />
          </View>

          {/* Additional Notes */}
          {pet.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text" size={18} color="#FA8630" />{" "}
                Additional Notes
              </Text>
              <Text style={styles.notesText}>{pet.notes}</Text>
            </View>
          )}
        </View>

        {/* Adopt Button */}
        <TouchableOpacity style={styles.adoptButton} onPress={handleAdoptPress}>
          <FontAwesome name="heart" size={18} color="white" />
          <Text style={styles.adoptButtonText}> Adopt Me</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Zoom Modal */}
      <Modal
        visible={zoomVisible}
        transparent={true}
        onRequestClose={closeImageZoom}
      >
        <TouchableWithoutFeedback onPress={closeImageZoom}>
          <View style={styles.zoomModalBackground}>
            <View style={styles.zoomModalContainer}>
              <Image
                source={
                  typeof currentZoomImage === "string"
                    ? { uri: currentZoomImage }
                    : currentZoomImage
                }
                style={styles.zoomedImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeImageZoom}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      <MaterialIcons
        name={icon}
        size={16}
        color="#888"
        style={styles.rowIcon}
      />
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 4,
  },
  content: {
    paddingBottom: 20,
  },
  carouselContainer: {
    height: 150,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  imageContainer: {
    width: screenWidth - 20,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FA8630",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#FA8630",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: "#666",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  adoptButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FA8630",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  adoptButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Zoom modal styles
  zoomModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomModalContainer: {
    width: "100%",
    height: "80%",
    position: "relative",
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
});

export default AnimalProfileScreen;
