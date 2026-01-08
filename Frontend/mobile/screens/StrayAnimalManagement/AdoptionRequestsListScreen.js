import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

const AdoptionRequestsListScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userDataStr = await AsyncStorage.getItem("@cityvetcare_user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const ownerId = userData?.owner_id || userData?.id;

      if (!ownerId) {
        setError("Please log in to view your requests");
        setIsLoading(false);
        return;
      }

      const response = await api.adoptionRequests.listByUser(ownerId);
      const data = response?.data || [];
      setRequests(data);
    } catch (err) {
      console.error("Failed to load adoption requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#FFA500";
      case "approved":
        return "#28A745";
      case "rejected":
        return "#DC3545";
      default:
        return "#6C757D";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "time-outline";
      case "approved":
        return "checkmark-circle-outline";
      case "rejected":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const renderRequestCard = (request) => {
    const statusColor = getStatusColor(request.status);
    const statusIcon = getStatusIcon(request.status);

    return (
      <TouchableOpacity
        key={request.adoption_id}
        style={styles.requestCard}
        onPress={() =>
          navigation.navigate("AdoptionRequestDetail", { request })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>
              {request.animal_name || "Unknown Animal"}
            </Text>
            <Text style={styles.animalBreed}>
              {request.species} - {request.breed}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={16} color="#fff" />
            <Text style={styles.statusText}>
              {request.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Submitted: {new Date(request.request_date).toLocaleDateString()}
            </Text>
          </View>
          {request.approved_date && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-outline" size={16} color="#666" />
              <Text style={styles.infoText}>
                Processed:{" "}
                {new Date(request.approved_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailsText}>Tap to view details</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#FD7E14" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Adoption Requests</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.orangeDivider} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRequests}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FD7E14"]}
            />
          }
        >
          {requests.length > 0 ? (
            requests.map(renderRequestCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No adoption requests yet</Text>
              <Text style={styles.emptySubtext}>
                Submit an adoption form to see it here
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F1",
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  orangeDivider: {
    height: 3,
    backgroundColor: "#FD7E14",
    marginTop: 10,
    borderRadius: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#DC3545",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#FD7E14",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  animalBreed: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#FD7E14",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#AAA",
    textAlign: "center",
  },
});

export default AdoptionRequestsListScreen;
