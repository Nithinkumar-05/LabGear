import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Button, Image, TouchableOpacity, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

    if (!username.trim()) return setError("Please enter a username");
    if (!email.trim()) return setError("Please enter an email address");
    if (!validateEmail(email)) return setError("Please enter a valid email address");
    if (!image) return setError("Please select a profile image");

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Image URI:", image);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
                  keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 100}
            
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
                Profile Screen
              </Text>

              {/* Profile Image Upload */}
              <TouchableOpacity
                onPress={pickImage}
                disabled={loading}
                activeOpacity={0.7}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                  marginBottom: 20,
                  overflow: "hidden",
                }}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : image ? (
                  <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Text style={{ color: "#888", textAlign: "center" }}>Tap to upload{'\n'}profile picture</Text>
                )}
              </TouchableOpacity>

              {/* Username Input */}
              <TextInput
                style={{
                  width: "100%",
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  marginBottom: 15,
                }}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                autoCapitalize="none"
              />

              {/* Email Input */}
              <TextInput
                style={{
                  width: "100%",
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  marginBottom: 15,
                }}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
                autoCapitalize="none"
              />
              <TextInput
                style={{
                  width: "100%",
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  marginBottom: 15,
                }}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
                autoCapitalize="none"
              />
              <TextInput
                style={{
                  width: "100%",
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  marginBottom: 15,
                }}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
                autoCapitalize="none"
              />

              {/* Error Message */}
              {error && <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>{error}</Text>}

              {/* Save Profile Button */}
              <Button title="Save Profile" onPress={handleSubmit} disabled={loading} />
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
