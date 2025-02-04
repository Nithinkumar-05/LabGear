import { Tabs,Redirect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from "@/components/CustomHeader";
import { useAuth } from "@/routes/AuthContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) return null; // Ensure user data is loaded
  if(user.role !== "admin"){
    if(user.role === "user"){
      return <Redirect href="/(user)/" />;
     } else if(user.role === "stock_manager"){
      return <Redirect href="/(stockmanager)/" />;
     }
  }
  
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
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
          name="user"
          options={{
            title: "User",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
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
