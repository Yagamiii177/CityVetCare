import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import LoginScreen from "./screens/Main/LoginScreen";
import RegisterScreen from "./screens/Main/RegisterScreen";
import HomePageScreen from "./screens/Main/HomePageScreen";
import MapScreen from "./screens/Main/MapScreen";
import ReportIncidentScreen from "./screens/ReportManagement/ReportIncidentScreen";
import LocationPickerScreen from "./screens/ReportManagement/LocationPickerScreen";
import QRScreen from "./screens/Main/QRScreen";
import NotificationsScreen from "./screens/Main/NotificationScreen";
import ProfileScreen from "./screens/Main/ProfileScreen";
import StrayListScreen from "./screens/StrayAnimalManagement/StrayListScreen";
import AdoptionScreen from "./screens/StrayAnimalManagement/AdoptionScreen";
import AnimalProfileScreen from "./screens/StrayAnimalManagement/AdoptionProfileScreen";
import AdoptionFormScreen from "./screens/StrayAnimalManagement/AdoptionFormScreen";
import StrayListProfileScreen from "./screens/StrayAnimalManagement/StrayListProfileScreen";
import RedemptionFormScreen from "./screens/StrayAnimalManagement/RedemptionFormScreen";
import AdoptionRequestsListScreen from "./screens/StrayAnimalManagement/AdoptionRequestsListScreen";
import AdoptionRequestDetailScreen from "./screens/StrayAnimalManagement/AdoptionRequestDetailScreen";
import RedemptionRequestsListScreen from "./screens/StrayAnimalManagement/RedemptionRequestsListScreen";
import RedemptionRequestDetailScreen from "./screens/StrayAnimalManagement/RedemptionRequestDetailScreen";
import AnimalLoggerHomePageScreen from "./screens/StrayAnimalManagement/AnimalLogger/AnimalLoggerHomeScreen";
import VetHomeScreen from "./screens/StrayAnimalManagement/AnimalLogger/VetHomeScreen";
import PetVaccinationScreen from "./screens/PetVaccinationManagement/PetVaccinationScreen";
import SuccessPage from "./screens/PetVaccinationManagement/SuccessPage";
import AboutUsScreen from "./screens/Main/AboutUsScreen";
import ReadingMaterialsScreen from "./screens/announcement_resources/reading_materials/readingMaterialsScreen";
import ReadingMaterialDetailScreen from "./screens/announcement_resources/reading_materials/readingMaterialDetailScreen";
import MapNearbyClinics from "./screens/announcement_resources/MapNearbyClinics";
import ReportStatus from "./screens/ReportManagement/ReportStatus";
<<<<<<< HEAD
import MyReportsScreen from "./screens/ReportManagement/MyReportsScreen";
import ReportDetailScreen from "./screens/ReportManagement/ReportDetailScreen";
import NotFound from "./screens/PetVaccinationManagement/NotFound";
import AnnouncementScreen from "./screens/CampaignManagement/AnnouncementScreen";
=======
import AnnouncementScreen from "./screens/announcement_resources/announcement/announcementScreen";
import AnnouncementDetailScreen from "./screens/announcement_resources/announcement/announcementDetailScreen";
>>>>>>> 733077ab88905bd840cdb76d1034ae691aa16a7f
import RegisterPet from "./components/PetVaccinationManagement/RegisterPet";
import PetProfile from "./components/PetVaccinationManagement/PetProfile";
import NotFound from "./screens/PetVaccinationManagement/NotFound";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { preloadIcons } from "./utils/iconHelper";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload all app icons using the icon helper
        await preloadIcons();

        // Preload additional campaign images
        const additionalImages = [
          require("./assets/CampaignManagement/image7.png"),
          require("./assets/CampaignManagement/image9.png"),
          require("./assets/CampaignManagement/Opening-hours.jpg"),
          require("./assets/CampaignManagement/vaccination-schedule.jpg"),
        ];
        await Asset.loadAsync(additionalImages);
      } catch (e) {
        // Silently fail asset loading in production
        if (__DEV__) {
          console.warn("Asset loading error:", e);
        }
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              animation: "none",
              animationDuration: 0,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Main" component={MainStackScreen} />
            <Stack.Screen
              name="AnimalLoggerMain"
              component={AnimalLoggerHomePageScreen}
            />
            <Stack.Screen name="VetHome" component={VetHomeScreen} />
            <Stack.Screen
              name="ReportIncident"
              component={ReportIncidentScreen}
            />
            <Stack.Screen
              name="LocationPicker"
              component={LocationPickerScreen}
            />
            <Stack.Screen name="ReportStatus" component={ReportStatus} />
<<<<<<< HEAD
            <Stack.Screen name="MyReports" component={MyReportsScreen} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
            <Stack.Screen name="EventsScreen" component={EventsScreen} />
=======
>>>>>>> 733077ab88905bd840cdb76d1034ae691aa16a7f
            <Stack.Screen name="Announcement" component={AnnouncementScreen} />
            <Stack.Screen
              name="AnnouncementDetail"
              component={AnnouncementDetailScreen}
            />
            <Stack.Screen
              name="ReadingMaterials"
              component={ReadingMaterialsScreen}
            />
            <Stack.Screen
              name="ReadingMaterialDetail"
              component={ReadingMaterialDetailScreen}
            />
            <Stack.Screen
              name="MapNearbyClinics"
              component={MapNearbyClinics}
            />
            <Stack.Screen
              name="PetVaccination"
              component={PetVaccinationScreen}
            />
            <Stack.Screen name="RegisterPet" component={RegisterPet} />
            <Stack.Screen name="PetProfile" component={PetProfile} />
            <Stack.Screen name="NotFound" component={NotFound} />
            <Stack.Screen name="SuccessPage" component={SuccessPage} />
            <Stack.Screen
              name="AnimalProfile"
              component={AnimalProfileScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

function MainStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
        animationDuration: 0,
      }}
    >
      <Stack.Screen name="HomePage" component={HomePageScreen} />
      <Stack.Screen name="MapNearbyClinics" component={MapNearbyClinics} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen
        name="QR"
        component={QRScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      <Stack.Screen
        name="PetVaccination"
        component={PetVaccinationScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />

      <Stack.Screen name="Success" component={SuccessPage} />
      <Stack.Screen name="Register" component={RegisterPet} />
      <Stack.Screen name="StrayList" component={StrayListScreen} />
      <Stack.Screen
        name="PetProfile"
        component={PetProfile}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />

      <Stack.Screen
        name="AdoptionList"
        component={AdoptionScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="ReportStatus"
        component={ReportStatus}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{
          animation: "slide_from_bottom",
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{
          animation: "slide_from_bottom",
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="AdoptionForm"
        component={AdoptionFormScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="StrayListProfile"
        component={StrayListProfileScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="RedemptionForm"
        component={RedemptionFormScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="AdoptionRequestsList"
        component={AdoptionRequestsListScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="AdoptionRequestDetail"
        component={AdoptionRequestDetailScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="RedemptionRequestsList"
        component={RedemptionRequestsListScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="RedemptionRequestDetail"
        component={RedemptionRequestDetailScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="AnnouncementDetail"
        component={AnnouncementDetailScreen}
        options={{
          animation: "slide_from_bottom",
          animationDuration: 300,
        }}
      />
      <Stack.Screen
        name="ReportIncident"
        component={ReportIncidentScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="LocationPicker"
        component={LocationPickerScreen}
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen name="PetDetails" component={PetProfile} />
      <Stack.Screen name="Signup" component={LoginScreen} />
    </Stack.Navigator>
  );
}
