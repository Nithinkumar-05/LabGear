import { Stack } from "expo-router";
const _layout = () => {
  return (
    <Stack>
      {/* Define the home screen */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false, // Hide the header

        }}
      />

      <Stack.Screen
        name="notifications"
        options={{ presentation: "fullScreenModal", title: "Notifications", animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="requestsummary"
        options={{ presentation: "fullScreenModal", title: "RequestSummary", animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="editprofile"
        options={{ presentation: "fullScreenModal", title: "Edit Profile", animation: "slide_from_right" }}
      />
    </Stack>
  );
};

export default _layout;
