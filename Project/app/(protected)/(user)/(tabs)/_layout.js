import { Tabs, Redirect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from "@/components/CustomHeader";
import { useAuth } from "@/routes/AuthContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
export default function TabsLayout() {
  const { user } = useAuth();

  // Check if the user is loading or not available yet
  if (user === undefined) {
    return <Loading />; // Show a loading component or spinner while waiting for user data
  }

  if (!user) {
    return <Redirect href="/signIn" />; // or any other redirect logic
  }
  // if(user.role !== "user"){
  //   if(user.role === "admin"){
  //     return <Redirect href="/(protected)/(admin)/" />;
  //    } else if(user.role === "stock_manager"){
  //     return <Redirect href="/(protected)/(stockmanager)/" />;
  //    }else{
  //       return <Redirect href="/signIn"/>
  //    }
  // }

  return (
    <ProtectedRoute allowedRoles={["user"]}> {/* Allow only users */}
      <Tabs initialRouteName="index" options={{ headerShown: false }}>
        {/* Index Tab (Default Tab) */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home", // Title displayed in the tab bar
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            header: () => <CustomHeader />, // Custom header
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile", // Title displayed in the tab bar
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
            tabBarHideOnKeyboard: true,
            header: () => <CustomHeader />, // Custom header
          }}
        />

        {/* More Tab */}
        <Tabs.Screen
          name="more"
          options={{
            title: "More", // Title displayed in the tab bar
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ellipsis-horizontal" size={size} color={color} />
            ),
            header: () => <CustomHeader />, // Custom header
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
