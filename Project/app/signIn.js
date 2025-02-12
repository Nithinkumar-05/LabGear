import React, { useRef, useState, useEffect } from "react";
import errorMessage from "../utils/ErrorMessages";
import { View, Text, TextInput, TouchableOpacity, Image, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../routes/AuthContext";
import { ActivityIndicator } from "react-native-paper";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const SignIn = () => {
  const { login, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();

  // Navigate to the appropriate dashboard based on the user's role
  const navigateToRoleDashboard = (userRole) => {
    switch (userRole) {
      case "admin":
        router.replace("/(protected)/(admin)/");
        break;
      case "stock_manager":
        router.replace("/(protected)/(stockmanager)/");
        break;
      case "user":
        router.replace("/(protected)/(user)/");
        break;
      default:
        router.replace("/(protected)/home");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigateToRoleDashboard(role);
    }
  }, [isAuthenticated, role]);

  const signIn = async () => {
    setLoading(true);
    setError(null);

    if (!emailRef.current || !passwordRef.current) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await login(emailRef.current, passwordRef.current);
      if (!response.success) {
        setError(errorMessage(response.msg));
        setLoading(false);
        return;
      }
      const userRole = response.data.role;
      navigateToRoleDashboard(userRole);
    } catch (e) {
      setError(e.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white"
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View className="min-h-screen justify-center items-center px-6 py-10">
        <View className="items-center mb-6 right-12">
          <Image 
            source={require("../assets/images/lab_gear.jpg")} 
            style={{ width: hp(45), height: hp(20) }} 
            className="rounded-lg"
          />
        </View>

        <View className="w-full border border-gray-300 rounded-3xl p-6 shadow-lg bg-white mb-6">
          <Text className="text-2xl font-semibold mb-4 text-center">Sign In</Text>
          {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

          <View className="gap-2">
            <View>
              <Text className="text-lg font-semibold ml-2 mb-2">Email</Text>
              <TextInput
                placeholder="Enter your email"
                onChangeText={(text) => (emailRef.current = text)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg p-4 text-base"
              />
            </View>

            <View>
              <Text className="text-lg font-semibold ml-2 mb-2">Password</Text>
              <View className="border border-gray-300 rounded-lg flex-row items-center p-2">
                <TextInput
                  className="flex-1 text-base p-2"
                  placeholder="Enter your password"
                  onChangeText={(text) => (passwordRef.current = text)}
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity 
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  className="px-2"
                >
                  <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={22} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={signIn}
              disabled={loading}
              className={`p-4 rounded-lg items-center mt-4 ${loading ? "bg-gray-400" : "bg-black"}`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View className="flex-row items-center justify-center space-x-2">
                  <Text className="text-white font-semibold text-base">Login</Text>
                  <AntDesign name="arrowright" size={22} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SignIn;