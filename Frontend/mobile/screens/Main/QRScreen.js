import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import BottomTabNavigator from "../../components/BottomNavigation";

const { width, height } = Dimensions.get("window");
const SCANNER_SIZE = width * 0.7; // Scanner square size (70% of screen width)

const QRScreen = ({ navigation }) => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    if (isValidUrl(data)) {
      try {
        const supported = await Linking.canOpenURL(data);
        if (supported) {
          await Linking.openURL(data);
        } else {
          alert(`Don't know how to open this URL: ${data}`);
        }
      } catch (error) {
        alert(`Failed to open URL: ${error.message}`);
      }
    } else {
      alert(`Scanned QR Code: ${data}`);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting permission...</Text>
        <BottomTabNavigator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <BottomTabNavigator />
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Dark Overlay with Scanner Window */}
        {!scanned && (
          <View style={styles.overlay}>
            {/* Top dark area */}
            <View
              style={[styles.darkArea, { height: (height - SCANNER_SIZE) / 2 }]}
            />

            {/* Middle row with scanner */}
            <View style={styles.middleRow}>
              {/* Left dark area */}
              <View
                style={[styles.darkArea, { width: (width - SCANNER_SIZE) / 2 }]}
              />

              {/* Scanner Frame */}
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              {/* Right dark area */}
              <View
                style={[styles.darkArea, { width: (width - SCANNER_SIZE) / 2 }]}
              />
            </View>

            {/* Bottom dark area */}
            <View
              style={[styles.darkArea, { height: (height - SCANNER_SIZE) / 2 }]}
            />
          </View>
        )}

        {/* Flip Camera Button */}
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>

        {/* Scan Result */}
        {scanned && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Scanned: {scannedData}</Text>
            <Button
              title="Scan Again"
              onPress={() => setScanned(false)}
              color="#FF6B6B"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  darkArea: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  middleRow: {
    flexDirection: "row",
    width: "100%",
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "space-between",
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FA8630",
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 5,
    borderLeftWidth: 5,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 5,
    borderRightWidth: 5,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
  resultContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
  },
  resultText: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  flipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QRScreen;
