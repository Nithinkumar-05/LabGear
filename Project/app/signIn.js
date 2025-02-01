import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../routes/AuthContext";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();

  const navigateToRoleDashboard = (userRole) => {
    switch (userRole) {
      case "admin":
        router.replace("/(protected)/(admin)");
        break;
      case "stock_manager":
        router.replace("/(protected)/(stockmanager)");
        break;
      case "user":
        router.replace("/(protected)/(user)");
        break;
      default:
        router.replace("/(protected)/home");
    }
  };

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
        setError(response.msg);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 100}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="flex-1 bg-white justify-center items-center px-6 shadow-3xl">
          <View className="relative mb-6 right-10">
            <Image source={require("../assets/images/lab_gear.jpg")} style={{ width: hp(40), height: hp(20) }} className="right-2" />
          </View>

          <View className="w-full border border-gray-300 rounded-3xl p-6 shadow-black shadow-3xl mb-6">
            <Text className="text-2xl font-semibold mb-4 text-center">Sign In</Text>
            {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

            <View>
              <Text className="text-lg font-semibold ml-2 mb-2">Email</Text>
              <TextInput
                placeholder="Enter your email"
                onChangeText={(text) => (emailRef.current = text)}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg p-4 text-base mb-4"
              />
            </View>

            <View>
              <Text className="text-lg font-semibold ml-2 mb-2">Password</Text>
              <View className="border border-gray-300 rounded-lg flex-row items-center mb-4 p-2">
                <TextInput
                  className="flex-1 text-base p-4"
                  placeholder="Enter your password"
                  onChangeText={(text) => (passwordRef.current = text)}
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} className="p-2">
                  <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={24} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={signIn}
              disabled={loading}
              className={`p-4 rounded-lg items-center mb-6 ${loading ? "bg-gray-400" : "bg-black"}`}
            >
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-semibold text-base rounded-3xl">Login →</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;