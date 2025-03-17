import { Slot, Stack, useRouter, useSegments } from "expo-router";
import "@/global.css";

import "../global.css";
import { View } from "react-native";
import { useAuth, AuthProvider } from "@/routes/AuthContext";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { NotificationProvider } from "@/routes/NotificationContext";
import { RefreshProvider } from "@/routes/RefreshContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})
const MainLayout = () => {
  const { isAuthenticated } = useAuth(); // Use the authentication state from context
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (typeof isAuthenticated === "undefined") {
      return; // Wait for the authentication state to be determined
    }

    const inProtectedApp = segments[0] === "(protected)"; // Check if the current route is in the protected folder

    //console.log("inProtectedApp:", inProtectedApp, "isAuthenticated:", isAuthenticated);

    if (isAuthenticated && !inProtectedApp) {
      // Redirect to the protected home page if authenticated and not already in protected routes
      router.replace("/(protected)/home");
    } else if (!isAuthenticated && inProtectedApp) {
      // Navigate to sign-in if not authenticated and trying to access protected routes
      router.replace("/signIn");
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }} />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(protected)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[...missing]"
        options={{
          title: "404 Error"
        }} />
    </Stack>

  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RefreshProvider>
        <MainLayout />
      </RefreshProvider>
    </AuthProvider >
  );
}
