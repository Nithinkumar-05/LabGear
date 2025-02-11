import { Stack } from "expo-router";

const AdminLayout = () => {
  return (
    <Stack>
      {/* Tab Layout (Admin's main navigation) */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-equipment"
        options={{ 
          presentation: "modal", 
          title: "Add Equipment" 
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{ 
          presentation: "fullScreenModal", 
          title: "Notifications" 
        }}
      />
      <Stack.Screen
        name="userDetails"
        options={{
          title:"User Details",
          presentation: "card",
        }}
      />
    </Stack>
  );
};

export default AdminLayout;