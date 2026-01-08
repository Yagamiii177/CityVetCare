import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../services/api";
import { resolveImageUri } from "../../utils/resolveImageUri";

const RedemptionRequestDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params || {};

  const [stray, setStray] = useState(null);
  const [loadingStray, setLoadingStray] = useState(false);

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Request not found</Text>
      </View>
    );
  }

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

  const statusColor = getStatusColor(request.status);
  const statusIcon = getStatusIcon(request.status);

  const strayId = request?.stray_id ?? request?.animal_id ?? null;

  useEffect(() => {
    let isMounted = true;

    const loadStray = async () => {
      if (!strayId) return;
      try {
        setLoadingStray(true);
        const resp = await api.strayAnimals.getById(strayId);
        const strayData = resp?.data || resp;
        if (isMounted) setStray(strayData);
      } catch (e) {
        console.warn("Failed to load stray animal details", e);
      } finally {
        if (isMounted) setLoadingStray(false);
      }
    };

    loadStray();

    return () => {
      isMounted = false;
    };
  }, [strayId]);

  const animalImages = useMemo(() => {
    const raw = stray?.images ?? stray?.image ?? null;
    if (!raw) return [];

    try {
      if (Array.isArray(raw)) return raw.filter(Boolean);
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        }
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object") {
            return Object.values(parsed).filter(Boolean);
          }
        }
        return [trimmed];
      }
      if (typeof raw === "object") {
        return Object.values(raw).filter(Boolean);
      }
    } catch (e) {
      console.warn("Failed to parse stray images", e);
    }

    return [];
  }, [stray]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.orangeDivider} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[styles.statusBadgeLarge, { backgroundColor: statusColor }]}
          >
            <Ionicons name={statusIcon} size={32} color="#fff" />
          </View>
          <Text style={styles.statusTitle}>
            {request.status?.toUpperCase() || "UNKNOWN"}
          </Text>
          <Text style={styles.statusSubtext}>
            {request.status === "pending" && "Your request is being reviewed"}
            {request.status === "approved" && "Your request has been approved!"}
            {request.status === "rejected" && "Your request was not approved"}
          </Text>
        </View>

        {/* Animal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="paw-outline" size={20} color="#FD7E14" />
            <Text style={styles.sectionTitle}>Animal Information</Text>
          </View>

          {/* Animal Images */}
          <View style={styles.imageSection}>
            <Text style={styles.imageSectionTitle}>Photos</Text>
            {loadingStray ? (
              <View style={styles.imageLoadingRow}>
                <ActivityIndicator size="small" color="#FD7E14" />
                <Text style={styles.imageHint}>Loading photos…</Text>
              </View>
            ) : animalImages.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {animalImages.map((uri, idx) => {
                  const resolved = resolveImageUri(uri);
                  if (!resolved) return null;
                  return (
                    <Image
                      key={`${idx}-${resolved}`}
                      source={{ uri: resolved }}
                      style={styles.animalImage}
                    />
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.imageHint}>No photos available.</Text>
            )}
          </View>

          <View style={styles.infoGroup}>
            <InfoRow label="Name" value={request.animal_name || "Unknown"} />
            <InfoRow label="Species" value={request.species || "Unknown"} />
            <InfoRow label="Breed" value={request.breed || "Unknown"} />
          </View>
        </View>

        {/* Request Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#FD7E14" />
            <Text style={styles.sectionTitle}>Request Information</Text>
          </View>
          <View style={styles.infoGroup}>
            <InfoRow label="Request ID" value={`#${request.redemption_id}`} />
            <InfoRow
              label="Submitted"
              value={new Date(request.request_date).toLocaleDateString()}
            />
            {request.remarks && (
              <InfoRow label="Remarks" value={request.remarks} multiline />
            )}
          </View>
        </View>

        {/* Owner Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#FD7E14" />
            <Text style={styles.sectionTitle}>Your Information</Text>
          </View>
          <View style={styles.infoGroup}>
            <InfoRow label="Name" value={request.owner_name || "N/A"} />
            <InfoRow label="Email" value={request.owner_email || "N/A"} />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#FD7E14"
            />
            <Text style={styles.sectionTitle}>Need Help?</Text>
          </View>
          <Text style={styles.helpText}>
            If you have questions about your redemption request, please contact
            the City Veterinary Office.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value, multiline }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>
      {value || "N/A"}
    </Text>
  </View>
);

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  section: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  infoGroup: {
    gap: 12,
  },
  imageSection: {
    marginBottom: 16,
  },
  imageSectionTitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  imageLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageHint: {
    fontSize: 13,
    color: "#666",
  },
  animalImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#F3F4F6",
  },
  infoRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  infoValueMultiline: {
    lineHeight: 22,
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#DC3545",
    textAlign: "center",
    marginTop: 40,
  },
});

export default RedemptionRequestDetailScreen;
