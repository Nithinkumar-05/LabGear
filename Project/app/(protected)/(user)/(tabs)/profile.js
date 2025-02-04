import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { heightPercentageToDP as hp,widthPercentageToDP as wp } from "react-native-responsive-screen";
export default function Profile() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Sorry, we need camera roll permissions to make this work!");
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        handleInputChange("image", result.assets[0].uri);
      }
    } catch (err) {
      setError("Failed to pick image: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Please enter a username");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter an email address");
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.image) {
      setError("Please select a profile image");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setError(null);
    
    if (validateForm()) {
      console.log("Form Data:", formData);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 10}
          >
            <View className="flex-1 justify-center p-5">
              <Text className="text-2xl font-bold text-center mb-5">
                Profile Screen
              </Text>

              <TouchableOpacity
                onPress={pickImage}
                disabled={loading}
                activeOpacity={0.7}
                style={{height:hp(20),width:hp(20)}}
                className="rounded-full bg-gray-100 justify-center items-center self-center mb-5 overflow-hidden"
              >
                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : formData.image ? (
                  <Image 
                    source={{ uri: formData.image }} 
                    className="w-full h-full" 
                  />
                ) : (
                  <Text className="text-gray-500 text-center">
                    Tap to upload{"\n"}profile picture
                  </Text>
                )}
              </TouchableOpacity>

              <TextInput
                className="w-full h-[50px] border border-gray-300 rounded-xl px-4 mb-4"
                placeholder="Username"
                value={formData.username}
                onChangeText={(value) => handleInputChange("username", value)}
                editable={!loading}
                autoCapitalize="none"
              />

              <TextInput
                className="w-full h-[50px] border border-gray-300 rounded-xl px-4 mb-4"
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                editable={!loading}
                autoCapitalize="none"
              />

              {error && (
                <Text className="text-red-500 text-center mb-2.5">
                  {error}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-black py-3 px-6 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Save Profile
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}