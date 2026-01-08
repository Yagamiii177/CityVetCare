import React from "react";
import EnhancedAnnouncementListScreen from "./enhancedAnnouncementListScreen";

/**
 * AnnouncementScreen - Wrapper component
 * Uses the enhanced version with read/unread tracking, filters, and search
 */
const AnnouncementScreen = ({ navigation }) => {
  return <EnhancedAnnouncementListScreen navigation={navigation} />;
};

export default AnnouncementScreen;
