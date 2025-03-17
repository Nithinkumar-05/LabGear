import { useEffect, useRef, useState } from "react";
import { View, Image, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import OnBoarding from "@/components/OnBoarding";

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { height } = Dimensions.get("window");

  const checkOnBoardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem("onboardingStatus");
      setOnboardingStatus(status);
      setIsReady(true);
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      setIsReady(true); // Still set ready even if there's an error
    }
  };

  useEffect(() => {
    const startAnimation = () => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => {
        checkOnBoardingStatus();
      });
    };

    // Use a small delay to ensure the Root Layout is mounted
    const timer = setTimeout(() => {
      startAnimation();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && onboardingStatus !== null) {
      // Use requestAnimationFrame to ensure we're in a stable UI cycle
      requestAnimationFrame(() => {
        if (onboardingStatus === "completed") {
          router.replace("/signIn");
        } else {
          router.replace("/onboarding");
        }
      });
    }
  }, [onboardingStatus, isReady]);

  return (
    <View className="flex-1 bg-white items-center justify-between">
      {/* Larger image taking up most of the screen */}
      <View className="w-full items-center">
        <Image 
          source={require("../assets/images/lab_gear.jpg")} 
          className="w-full h-52" 
          resizeMode="cover"
        />
      </View>
      
      
      
      {/* Loading bar at the bottom with more padding */}
      <View className="w-full px-8 mb-10">
        <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-black"
            style={{
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            }}
          />
        </View>
      </View>
    </View>
  );
}