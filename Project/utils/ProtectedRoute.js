import { useEffect } from "react";
import { useAuth } from "../routes/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to the sign-in page if not authenticated
        router.replace("/signIn");
        return;
      }

      // Redirect to the appropriate dashboard if the role doesn't match
      if (requiredRole && user.role !== requiredRole) {
        const roleBasedRoutes = {
          admin: "/(protected)/(admin)",
          user: "/(protected)/(user)",
          stock_manager: "/(protected)/(stockmanager)",
        };

        const redirectTo = roleBasedRoutes[user.role] || "/";
        router.replace(redirectTo);
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  // Show a loader while checking authentication state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // If user is not authorized for this role, do not render children
  if (!isAuthenticated || (requiredRole && user.role !== requiredRole)) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>You do not have permission to access this page.</Text>
      </View>
    );
  }

  // Render children for authorized users
  return children;
};

export default ProtectedRoute;
