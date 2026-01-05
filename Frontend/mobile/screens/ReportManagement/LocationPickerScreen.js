import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, StatusBar, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { incidentService } from '../../services/apiService';

const LocationPickerScreen = ({ navigation, route }) => {
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      setIsLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarker({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleMapPress = (e) => {
    setMarker(e.nativeEvent.coordinate);
  };

  const handleConfirmPress = () => {
    if (!marker) {
      Alert.alert('No Location', 'Please select a location on the map');
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      const finalReport = {
        ...route.params?.reportData,
        location: marker,
        timestamp: new Date().toISOString()
      };
      
      // Submit to backend
      const response = await incidentService.create(finalReport);
      
      setShowConfirmation(false);
      setShowSuccessModal(true);
    } catch (error) {
      setShowConfirmation(false);
      Alert.alert(
        'Submission Error',
        'Failed to submit your report. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHomePress = () => {
    setShowSuccessModal(false);
    navigation.navigate('Main', { screen: 'HomePage' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FD7E14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Map View */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          toolbarEnabled={false}
        >
          {marker && (
            <Marker 
              coordinate={marker}
              pinColor="#FD7E14"
            />
          )}
        </MapView>
      )}

      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.currentLocationButton} 
        onPress={getCurrentLocation}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Location Info Box */}
      {marker && (
        <View style={styles.locationInfoBox}>
          <Text style={styles.locationInfoText}>
            Latitude: {marker.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationInfoText}>
            Longitude: {marker.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Confirm Button */}
      <TouchableOpacity 
        style={[
          styles.confirmButton,
          !marker && styles.confirmButtonDisabled
        ]} 
        onPress={handleConfirmPress}
        activeOpacity={0.7}
        disabled={!marker}
      >
        <Text style={styles.confirmButtonText}>Confirm Location</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Location</Text>
            <Text style={styles.modalText}>
              Are you sure this is the correct location for your report?
            </Text>
            <Text style={styles.modalCoordinates}>
              Latitude: {marker?.latitude.toFixed(6)}
              {'\n'}
              Longitude: {marker?.longitude.toFixed(6)}
            </Text>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleFinalConfirm}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalContainer}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalTitle}>Thank You!</Text>
            <Text style={styles.successModalText}>Your report is now being processed</Text>
            
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={handleHomePress}
              activeOpacity={0.7}
            >
              <Text style={styles.homeButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  currentLocationButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#FD7E14',
    padding: 12,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  locationInfoBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#333',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#FD7E14',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  modalCoordinates: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#FD7E14',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Success Modal styles
  successModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 16,
    marginBottom: 25,
    color: '#555',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#FD7E14',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationPickerScreen;