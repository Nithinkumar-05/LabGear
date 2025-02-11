import React, { useRef, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Animated, TouchableOpacity, Alert, Text } from "react-native";
import { useAuth } from "@/routes/AuthContext";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import { Avatar, Button, Divider } from "react-native-paper";
import usersRef from '@/firebaseConfig';
export default function Profile() {
  const { user } = useAuth(); // Get user details
  const [image, setImage] = useState(user?.photoURL || null);
  const placeholderImage = "https://via.placeholder.com/350/";

  
  // Function to pick an image from the gallery
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "Allow access to your gallery to upload a profile picture.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images','livePhotos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Update image state
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>

        {/* Profile Card */}
        <View className="p-6 items-center w-full">
          {/* Rotating Avatar Border */}
          <Animated.View
            className="border-4 border-blue-500 rounded-full p-1 shadow-md"
          >
            <TouchableOpacity onPress={pickImage} className="relative">
              <Avatar.Image size={160} className="bg-slate-400" source={{ uri: image || placeholderImage }} />
              
              {/* Show text if placeholder image is displayed */}
              {!image && (
                <View className="absolute inset-0 flex items-center justify-center rounded-full">
                  <Text className="text-white font-semibold">Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* User Info */}
        <Text className="text-xl font-semibold mt-3">{user?.username || "John Doe"}</Text>
        <Text className="text-gray-500">{user?.email || "johndoe@example.com"}</Text>

        {/* Personal Details */}
        <View className="mt-8 w-full">
          <Text className="text-lg font-semibold text-gray-700">Personal Details</Text>
          <Divider 
          className="my-2"
          style={{ backgroundColor: "black", height: 1 }} />

          {/* Buttons */}
          <Button mode="contained" theme={{ colors: { primary: "#3b82f6" } }} className="mt-4 w-full">
            Edit Profile
          </Button>

          <Button mode="outlined" theme={{ colors: { primary: "#3b82f6" } }} className="mt-2 w-full">
            Logout
          </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
