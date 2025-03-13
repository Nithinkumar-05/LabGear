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
        name="invoice"
        options={{
          title: "Invoice",
          presentation: "modal"
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
          title: "User Details",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="add-user"
        options={{
          title: "Add User",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="requests"
        options={{
          title: "Requests",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notificationpreferences"
        options={{
          title: "Notification Preferences",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="trackbudget"
        options={{
          title: "Track Budget",
          presentation: "fullScreenModal",
        }} />
      <Stack.Screen
        name="labs"
        options={{
          title: "Labs",
          headerShown: "false",
          presentation: "containedTransparentModal",
          animation: "slide_from_right"
        }} />
    </Stack>
  );
};

export default AdminLayout;