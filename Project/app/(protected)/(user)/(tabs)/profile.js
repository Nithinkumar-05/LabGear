import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, Button, Image, TouchableOpacity, ActivityIndicator, SafeAreaView 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      setError(null);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      setError("Failed to pick image: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setError(null);

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!image) {
      setError("Please select a profile image");
      return;
    }

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Image URI:", image);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
          enableOnAndroid={true}
          extraScrollHeight={20} 
          enableAutomaticScroll={true} 
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold mb-5">Profile Screen</Text>

          <TouchableOpacity
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.7}
            className="w-36 h-36 rounded-full bg-gray-200 justify-center items-center mb-5 overflow-hidden"
          >
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : image ? (
              <Image 
                source={{ uri: image }} 
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <>
                <Text className="text-gray-500 text-center">Tap to upload</Text>
                <Text className="text-gray-500 text-center">profile picture</Text>
              </>
            )}
          </TouchableOpacity>

          <TextInput
            className="w-full h-12 border border-gray-300 rounded-lg px-4 mb-4"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            className="w-full h-12 border border-gray-300 rounded-lg px-4 mb-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

          <Button 
            title="Save Profile" 
            onPress={handleSubmit}
            disabled={loading}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
