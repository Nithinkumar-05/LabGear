import { useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the progress bar over 3 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      router.replace("/signIn"); // Navigate to login screen
    });
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Logo */}
      <Image source={require("../assets/images/lab_gear.jpg")} className="w-52 h-52" />

      {/* Progress Bar */}
      <View className="w-44 h-1 bg-gray-300 mt-4 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-black"
          style={{
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          }}
        />
      </View>
    </View>
  );
}
