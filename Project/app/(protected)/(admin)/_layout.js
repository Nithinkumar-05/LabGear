import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/routes/AuthContext";

const AdminLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to the sign-in page if the user is not authenticated
        router.replace("/signIn");
        return;
      }

      if (user.role !== "admin") {
        // Redirect to user-specific layout if the role is not admin
        const roleBasedRoutes = {
          user: "/(protected)/(user)",
          stock_manager: "/(protected)/(stockmanager)",
        };
        const redirectTo = roleBasedRoutes[user.role] || "/";
        router.replace(redirectTo);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render the admin layout stack if authenticated and authorized
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      {/* <Stack.Screen name="settings" options={{ headerTitle: "Admin Settings" }} /> */}
    </Stack>
  );
};

export default AdminLayout;
