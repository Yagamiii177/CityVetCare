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
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");

const StrayProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { pet } = route.params;

  const [zoomVisible, setZoomVisible] = useState(false);
  const [currentZoomImage, setCurrentZoomImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const petName = pet.name?.trim() !== "" ? pet.name : "Unnamed";

  const getImages = () => {
    if (pet.imageUrls?.length > 0) return pet.imageUrls;
    return [require("../../assets/icons/logo.png")];
  };

  const images = getImages();

  const handleRedeem = () => {
    if (pet.status === "Available") {
      navigation.navigate("RedemptionForm", { pet });
    }
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
          <Image source={source} style={styles.image} resizeMode="cover" />
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
        <Text style={styles.headerTitle}>Stray Animal Info</Text>
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
                event.nativeEvent.contentOffset.x / screenWidth
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
              <MaterialIcons name="pets" size={18} color="#FA8630" /> Basic Info
            </Text>
            <DetailRow icon="pets" label="Breed" value={pet.breed} />
            <DetailRow
              icon={pet.sex === "Male" ? "male" : "female"}
              label="Sex"
              value={pet.sex}
            />
            <DetailRow icon="palette" label="Color" value={pet.color} />
            <DetailRow icon="brush" label="Markings" value={pet.markings} />
            <DetailRow icon="pets" label="Type" value={pet.type} />
          </View>

          {/* Capture Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="place" size={18} color="#FA8630" /> Capture
              Info
            </Text>
            <DetailRow
              icon="calendar-today"
              label="Date Captured"
              value={pet.capturedDate}
            />
            <DetailRow
              icon="location-on"
              label="Location"
              value={pet.locationCaptured}
            />
          </View>

          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="info" size={18} color="#FA8630" /> Status
            </Text>
            <DetailRow icon="pets" label="Availability" value={pet.status} />
          </View>
        </View>

        {/* Redeem Button */}
        <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
          <FontAwesome name="home" size={18} color="white" />
          <Text style={styles.buttonText}> Redeem</Text>
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
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
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
  redeemButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FA8630",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
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

export default StrayProfileScreen;
