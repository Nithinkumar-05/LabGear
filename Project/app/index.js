import { useEffect, useRef, useState } from "react";
import { View, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import OnBoarding from "@/components/OnBoarding";
export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const [onboardingStatus, setOnboardingStatus] = useState(null);


  const checkOnBoardingStatus = async () => {

    try {
      const status = await AsyncStorage.getItem("onboardingStatus");

      setOnboardingStatus(status);
      // console.log(onboardingStatus)
      router.replace("/onboarding")

    }
    catch (error) {
      console.error("Error getting onboarding status:", error);
    }
  }

  useEffect(() => {

    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {

      checkOnBoardingStatus();
      router.replace("/signIn");
    });
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Logo */}
      <Image source={require("../assets/images/lab_gear.jpg")} className="w-52 h-52" />


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