import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../routes/AuthContext";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
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
      case 'admin':
        router.replace('/(protected)/(admin)');
        break;
      case 'stock_manager':
        router.replace('/(protected)/(stockmanager)');
        break;
      case 'user':
        router.replace('/(protected)/(user)');
        break;
      default:
        // Fallback to home if role is unknown
        router.replace('/(protected)/home');
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

      // Get user role from response and navigate accordingly
      const userRole = response.data.role;
      navigateToRoleDashboard(userRole);
      
    } catch (e) {
      setError(e.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6 shadow-lg">
      <View className="items-center mb-6 right-10 mr-10">
        <Image
          source={require("../assets/images/lab_gear.jpg")}
          style={{ width: hp(20), height: hp(20) }}
          className=""
        />
      </View>
      
      <View className="w-full border border-gray-300 rounded-lg p-6">
        <Text className="text-2xl font-semibold mb-4">Sign In</Text>
        {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

        <TextInput
          placeholder="Email"
          onChangeText={(text) => (emailRef.current = text)}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-lg p-4 text-base mb-4"
        />

        <View className="border border-gray-300 rounded-lg flex-row items-center mb-4 p-4">
          <TextInput
            placeholder="Password"
            onChangeText={(text) => (passwordRef.current = text)}
            secureTextEntry={!passwordVisible}
            className="flex-1 text-base"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={signIn}
          disabled={loading}
          className={`p-4 rounded-lg items-center ${
            loading ? "bg-gray-400" : "bg-black"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Login →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignIn;