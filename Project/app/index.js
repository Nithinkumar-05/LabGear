import { useEffect, useRef, useState } from "react";
import { View, Image, Text, Animated, Button, Platform, Alert, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
// import { ThemedView, ThemedText } from "./your-themed-components"; // Assuming this is where your themed components are imported from
import { useNotification } from "@/routes/NotificationContext.jsx"; // Assuming this is where your notification hook is imported from

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  const [dummyState, setDummyState] = useState(0);

  // SplashScreen related state and refs
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  // Check onboarding status
  const checkOnBoardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem("onboardingStatus");
      setOnboardingStatus(status);
      // Navigation based on onboarding status
      if (status) {
        router.replace("/signIn");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Error getting onboarding status:", error);
    }
  };

  // Handle update loading
  useEffect(() => {
    if (isUpdatePending) {
      dummyFunction();
    }
  }, [isUpdatePending]);

  // SplashScreen animation effect
  useEffect(() => {
    // Animate the progress bar over 3 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      // After animation completes, hide splash and check onboarding
      setShowSplash(false);
      checkOnBoardingStatus();
    });
  }, []);

  const dummyFunction = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      Alert.alert("Error");
    }
    // UNCOMMENT TO REPRODUCE EAS UPDATE ERROR
    finally {
      setDummyState(dummyState + 1);
      console.log("dummyFunction");
    }
  };

  // If we're still showing splash, render the splash screen
  if (showSplash) {
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

  // If true, we show the button to download and run the update
  const showDownloadButton = isUpdateAvailable;
  // Show whether or not we are running embedded code or an update
  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
    ? "This app is running from built-in code"
    : "This app is running an update";

  // Main app UI
  return (
    <View

    >
      <SafeAreaView style={{ flex: 1 }}>
        <Text >Updates Demo 5</Text>
        <Text>{runTypeMessage}</Text>
        <Button
          onPress={() => Updates.checkForUpdateAsync()}
          title="Check manually for updates"
        />
        {showDownloadButton ? (
          <Button
            onPress={() => Updates.fetchUpdateAsync()}
            title="Download and run update"
          />
        ) : null}
        <Text>
          Your push token:
        </Text>
        <Text>{expoPushToken}</Text>
        <Text>Latest notification:</Text>
        <Text>{notification?.request.content.title}</Text>
        <Text>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </Text>
      </SafeAreaView>
    </View>
  );
}