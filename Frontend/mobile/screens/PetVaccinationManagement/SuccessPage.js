import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";

const SuccessPage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get the pet data from navigation params
  const petData = route.params?.petData || {
    name: "",
    breed: "",
    type: "dog",
    sex: "",
    isCastrated: false,
    color: "",
    markings: "",
    images: {},
  };

  // Prepare QR code data with all pet information
  const qrData = JSON.stringify({
    name: petData.name,
    breed: petData.breed,
    type: petData.type,
    sex: petData.sex,
    isCastrated: petData.isCastrated,
    color: petData.color,
    markings: petData.markings,
    // You might want to include a unique ID or registration number here
    registrationDate: new Date().toISOString(),
  });

  const handleGoHome = () => {
    navigation.navigate("Main", { screen: "HomePage" });
  };

  const handleRegisterAgain = () => {
    navigation.navigate("RegisterPet");
  };
  const handleViewDetails = () => {
    navigation.navigate("PetDetails", {
      petData: {
        ...petData,
        // Include all necessary data
        name: petData.name,
        breed: petData.breed,
        sex: petData.sex,
        images: petData.images, // Make sure images are included
        // Add any other fields you need
      },
    });
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registration Successful!</Text>
          <Text style={styles.subtitle}>
            {petData.name}'s profile has been successfully registered.
          </Text>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Pet ID QR Code</Text>
            <View style={styles.qrCode}>
              <QRCode
                value={qrData}
                size={200}
                color="#1F2937"
                backgroundColor="white"
              />
            </View>
            <Text style={styles.qrNote}>
              Scan this code to access {petData.name}'s profile information
            </Text>
          </View>

          {/* Pet Details Section */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Registered Pet Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>
                {petData.name || "Not provided"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Breed:</Text>
              <Text style={styles.detailValue}>
                {petData.breed || "Not provided"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {petData.type
                  ? petData.type.charAt(0).toUpperCase() + petData.type.slice(1)
                  : "Not provided"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sex:</Text>
              <Text style={styles.detailValue}>
                {petData.sex
                  ? `${
                      petData.sex.charAt(0).toUpperCase() + petData.sex.slice(1)
                    }${petData.isCastrated ? " (Neutered)" : ""}`
                  : "Not provided"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color:</Text>
              <Text style={styles.detailValue}>
                {petData.color || "Not provided"}
              </Text>
            </View>

            {petData.markings && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Markings:</Text>
                <Text style={styles.detailValue}>{petData.markings}</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegisterAgain}>
              <Text style={styles.primaryButtonText}>Register Another Pet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleGoHome}>
              <Text style={styles.outlineButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// QR Scanner Screen (new component)
const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [scannedData, setScannedData] = useState(null);

  const handleBarCodeScanned = ({ data }) => {
    try {
      const parsedData = JSON.parse(data);
      setScannedData(parsedData);
    } catch (error) {
      Alert.alert("Error", "Invalid QR code format");
    }
  };

  return (
    <View style={styles.scannerContainer}>
      {!scannedData ? (
        <BarCodeScanner
          onBarCodeScanned={scannedData ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={styles.scannedDataContainer}>
          <Text style={styles.scannedTitle}>Pet Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{scannedData.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Breed:</Text>
            <Text style={styles.detailValue}>{scannedData.breed}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {scannedData.type.charAt(0).toUpperCase() +
                scannedData.type.slice(1)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sex:</Text>
            <Text style={styles.detailValue}>
              {scannedData.sex.charAt(0).toUpperCase() +
                scannedData.sex.slice(1)}
              {scannedData.isCastrated ? " (Neutered)" : ""}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Color:</Text>
            <Text style={styles.detailValue}>{scannedData.color}</Text>
          </View>

          {scannedData.markings && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Markings:</Text>
              <Text style={styles.detailValue}>{scannedData.markings}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScannedData(null)}>
            <Text style={styles.scanAgainButtonText}>Scan Another QR Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#E6F4F1",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 24,
    textAlign: "center",
  },
  qrContainer: {
    marginBottom: 24,
    alignItems: "center",
    width: "100%",
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  qrCode: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  qrNote: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: "80%",
  },
  detailsContainer: {
    width: "100%",
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    flexShrink: 1,
    marginLeft: 8,
    textAlign: "right",
    maxWidth: "60%",
  },
  buttonContainer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#F97316",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  // Scanner styles
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannedDataContainer: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  scannedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  scanAgainButton: {
    backgroundColor: "#F97316",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  scanAgainButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default SuccessPage;
