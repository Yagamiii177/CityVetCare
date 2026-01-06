  import React, { useState, useEffect } from "react";
  import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, Pressable, RefreshControl } from "react-native";
  import BottomTabNavigator from "../../components/BottomNavigation";
  import ScreenHeader from "../../components/ScreenHeader";
  import { useNavigation } from "@react-navigation/native";
  import { Ionicons } from "@expo/vector-icons";
  import { incidentService } from '../../services/apiService';
  import { API_BASE_URL } from '../../config/api';

  const NotificationScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const filterOptions = [
      { id: 'new_report', label: 'New Reports' },
      { id: 'report_status', label: 'Report Status' },
      { id: 'adoption_status', label: 'Adoption Status' },
      { id: 'pet_registration', label: 'Pet Registration' },
      { id: 'event_registration', label: 'Event Registration' },
    ];

    // Fetch notifications from backend
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/notifications`);
        if (response.ok) {
          const data = await response.json();
          const notificationList = data.notifications || [];
          
          // Transform backend notifications to match UI format
          const transformedNotifications = notificationList.map(notif => ({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            description: notif.message,
            icon: getIconForType(notif.type),
            screen: getScreenForType(notif.type),
            category: notif.type,
            date: notif.created_at ? notif.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
            incident_id: notif.incident_id,
            location: notif.location,
            reporter: notif.reporter
          }));
          
          // Add some sample notifications for demo (you can remove this later)
          const sampleNotifications = [
            {
              id: 'sample1',
              type: 'reading',
              title: 'New educational materials are available! Tap to explore.',
              icon: require('../../assets/icons/reading_materials_icon.png'),
              screen: 'ReadingMaterials',
              category: 'education',
              date: '2023-05-14',
            },
            {
              id: 'sample2',
              type: 'adoption',
              title: 'Your adoption application has been approved!',
              icon: require('../../assets/icons/adopt_pet_icon.png'),
              screen: 'AdoptionStatus',
              category: 'adoption_status',
              date: '2023-05-12',
            }
          ];
          
          setNotifications([...transformedNotifications, ...sampleNotifications]);
        }
      } catch (error) {
        // Set sample data on error for demo
        setNotifications([
          {
            id: 'sample1',
            type: 'reading',
            title: 'New educational materials are available! Tap to explore.',
            icon: require('../../assets/icons/reading_materials_icon.png'),
            screen: 'ReadingMaterials',
            category: 'education',
            date: '2023-05-14',
          }
        ]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    const getIconForType = (type) => {
      switch(type) {
        case 'new_report':
          return require('../../assets/icons/report_icon.png');
        case 'report_status':
          return require('../../assets/icons/report_icon.png');
        default:
          return require('../../assets/icons/logo.png');
      }
    };

    const getScreenForType = (type) => {
      switch(type) {
        case 'new_report':
        case 'report_status':
          return 'ReportStatus';
        default:
          return 'Home';
      }
    };

    useEffect(() => {
      fetchNotifications();
      
      // Set up polling for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000);
      
      return () => clearInterval(interval);
    }, []);

    const onRefresh = () => {
      setRefreshing(true);
      fetchNotifications();
    };

    // Handle notification press based on type/screen
    const handleNotificationPress = (notification) => {
      if (notification?.screen) {
        navigation.navigate(notification.screen);
      }
    };

    // Toggle filter selection
    const toggleFilter = (filterId) => {
      if (selectedFilters.includes(filterId)) {
        setSelectedFilters(selectedFilters.filter(id => id !== filterId));
      } else {
        setSelectedFilters([...selectedFilters, filterId]);
      }
    };

    // Filter notifications based on search query and selected filters
    const filteredNotifications = notifications.filter(notif => {
      const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilters = selectedFilters.length === 0 || selectedFilters.includes(notif.category);
      return matchesSearch && matchesFilters;
    });

    return (
      <View style={styles.container}>
        <ScreenHeader title="Notifications" />

        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notifications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Recent Notifications</Text>

          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={styles.notificationCard}
                onPress={() => handleNotificationPress(notif)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  <Image 
                    source={notif.icon}
                    style={styles.notificationIcon}
                  />
                  <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationText}>
                      {notif.title}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {notif.date}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultsText}>No notifications found</Text>
          )}
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Notifications</Text>
              
              {filterOptions.map(option => (
                <Pressable
                  key={option.id}
                  style={styles.filterOption}
                  onPress={() => toggleFilter(option.id)}
                >
                  <View style={styles.checkbox}>
                    {selectedFilters.includes(option.id) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.filterOptionText}>{option.label}</Text>
                </Pressable>
              ))}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setSelectedFilters([])}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setFilterModalVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BottomTabNavigator />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F1F1F1',
    },
    scrollContainer: {
      padding: 20,
      paddingBottom: 100,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 5,
      alignItems: 'center',
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingHorizontal: 15,
      marginRight: 10,
      height: 45,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 16,
    },
    filterButton: {
      width: 45,
      height: 45,
      borderRadius: 10,
      backgroundColor: '#FD7E14',
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    notificationContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    notificationIcon: {
      width: 28,
      height: 28,
      marginRight: 12,
      marginTop: 2,
    },
    notificationTextContainer: {
      flex: 1,
    },
    notificationText: {
      fontSize: 16,
      color: '#333',
      lineHeight: 22,
    },
    notificationDate: {
      fontSize: 12,
      color: '#888',
      marginTop: 5,
    },
    noResultsText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#888',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: '#FD7E14',
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterOptionText: {
      fontSize: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    resetButton: {
      padding: 10,
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      flex: 1,
      marginRight: 10,
      alignItems: 'center',
    },
    resetButtonText: {
      color: '#333',
      fontWeight: 'bold',
    },
    applyButton: {
      padding: 10,
      backgroundColor: '#FD7E14',
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
    },
    applyButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });

  export default NotificationScreen;