import { Redirect, Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from "@/components/CustomHeader";
import { useAuth } from "@/routes/AuthContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
import { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/signIn"/>; // If there's no user, handle appropriately (like redirecting to login)
  }
  if(user.role !== "stockmanager"){
    if(user.role === "admin"){
      return <Redirect href="/(admin)/" />;
     } else if(user.role === "user"){
      return <Redirect href="/(user)/" />;
     }  
  }

  return (
    // <ProtectedRoute allowedRoles={["stock_manager"]}>
      <Tabs initialRouteName="home">
        <Tabs.Screen
          name="home"
          options={{
            title: "Home", // Title displayed in the tab bar
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            header: () => <CustomHeader />,
          }}
        />
        <Tabs.Screen
         name="inventory"
         options={{
          title: "Stock",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
          header: () => <CustomHeader />,
          }}
          />
      </Tabs>
    // </ProtectedRoute>
  );
}