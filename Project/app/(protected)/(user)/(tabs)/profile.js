import React, { useRef, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Animated } from "react-native";
import { useAuth } from "@/routes/AuthContext";
import { Avatar, Text, Button, Surface, Divider } from "react-native-paper";

export default function Profile() {
  const { user } = useAuth(); // Get user details

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000, // Adjust speed
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop(); // Stop animation when unmounted
  }, []);

  // Convert spinAnim value to rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>

        {/* Profile Card */}
        <Surface className="p-6 rounded-xl bg-white shadow-lg items-center w-full">
          {/* Rotating Avatar Border */}
          <Animated.View
            className="border-4 border-blue-500 rounded-full p-1 shadow-md"
            style={{ transform: [{ rotateZ: spin }] }}
          >
            <Avatar.Image
              size={160}
              source={{ uri: user?.photoURL || "https://via.placeholder.com/350" }}
            />
          </Animated.View>

          {/* User Info */}
          <Text className="text-xl font-semibold mt-3">{user?.username || "John Doe"}</Text>
          <Text className="text-gray-500">{user?.email || "johndoe@example.com"}</Text>
        </Surface>

        {/* Personal Details */}
        <View className="mt-8 w-full">
          <Text className="text-lg font-semibold text-gray-700">Personal Details</Text>
          <Divider className="my-2" />

          {/* Buttons */}
          <Button
            mode="contained"
            theme={{ colors: { primary: "#3b82f6" } }}
            className="mt-4 w-full"
          >
            Edit Profile
          </Button>

          <Button
            mode="outlined"
            theme={{ colors: { primary: "#3b82f6" } }}
            className="mt-2 w-full"
          >
            Logout
          </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
