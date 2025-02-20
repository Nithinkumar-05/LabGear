import { Redirect, Tabs } from "expo-router";
import { Ionicons,FontAwesome5,MaterialIcons } from '@expo/vector-icons';
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
    return <Redirect href="/signIn"/>; 
  }
  return (
    <ProtectedRoute allowedRoles={["stock_manager"]}>
      <Tabs initialRouteName="home">
        <Tabs.Screen
          name="home"
          options={{
            title: "Home", 
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
              <MaterialIcons name="inventory" size={size} color={color} />          
            ),
          header: () => <CustomHeader />,
          }}
          />
          <Tabs.Screen
         name="requests"
         options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="mail-bulk" size={size} color={color} />
          ),
          header: () => <CustomHeader />,
          }}
          />
          <Tabs.Screen
         name="more"
         options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
          header: () => <CustomHeader />,
          }}
          />
      </Tabs>
    </ProtectedRoute>
  );
}