import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      {/* Tab Layout (Admin's main navigation) */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false, // Hide the header for tabs
        }}
      />
      {/* Add Equipment Page - Opens as a modal */}
      <Stack.Screen
        name="add-equipment"
        options={{ presentation: "modal", title: "Add Equipment" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ presentation: "fullScreenModal", title: "Notifications" }}
      />
    </Stack>
  );
};

export default _layout;
