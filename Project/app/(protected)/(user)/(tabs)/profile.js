import React from "react";
import { ScrollView, View, Image, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "@/routes/AuthContext";
import { useRouter } from "expo-router";

// Helper component for section titles
const SectionTitle = ({ title }) => (
  <View className="px-4 py-2 bg-gray-50">
    <Text className="text-sm font-medium text-gray-500">{title}</Text>
  </View>
);

// Helper component for profile information sections
const ProfileSection = ({ iconName, title, value }) => (
  <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
    <MaterialIcons name={iconName} size={24} color="#4B5563" />
    <View className="ml-3">
      <Text className="text-sm text-gray-500">{title}</Text>
      <Text className="text-base text-gray-900">{value || "Not provided"}</Text>
    </View>
  </View>
);

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Profile Header */}
      <View className="bg-gray-50 py-6 items-center">
        <View className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden">
          {user.personal?.profileImgUrl ? (
            <Image
              source={{ uri: user.personal.profileImgUrl }}
              className="w-full h-full"
            />
          ) : (
            <View className="w-full h-full bg-gray-300 justify-center items-center">
              <MaterialIcons name="person" size={48} color="#9CA3AF" />
            </View>
          )}
        </View>
        <Text className="text-xl font-bold text-gray-900">
          {user.personal?.name || "User"}
        </Text>
        <Text className="text-base text-gray-600 mt-1">
          {user.professional?.designation || "Lab Member"}
        </Text>

        <TouchableOpacity
          className="mt-4 flex-row items-center bg-white px-4 py-2 rounded-full shadow-sm"
          onPress={() => router.push("/editprofile")}
        >
          <MaterialIcons name="edit" size={20} color="#4B5563" />
          <Text className="ml-2 text-gray-700">Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      <SectionTitle title="PERSONAL DETAILS" />
      <ProfileSection
        iconName="email"
        title="Email"
        value={user.personal?.email}
      />
      <ProfileSection
        iconName="phone"
        title="Phone"
        value={user.personal?.phone}
      />
      <ProfileSection
        iconName="cake"
        title="Date of Birth"
        value={user.personal?.dob}
      />

      {/* Professional Information */}
      <SectionTitle title="PROFESSIONAL DETAILS" />
      <ProfileSection
        iconName="badge"
        title="Employee ID"
        value={user.professional?.empId}
      />
      <ProfileSection
        iconName="work"
        title="Designation"
        value={user.professional?.designation}
      />
      <ProfileSection
        iconName="business"
        title="Department"
        value={user.professional?.department}
      />

      {/* Lab Details */}
      <SectionTitle title="LAB DETAILS" />
      <ProfileSection
        iconName="science"
        title="Lab Reference"
        value={user.labDetails?.labs?.LAB0001 || "Not assigned"}
      />

      <View className="h-8" /> {/* Bottom spacing */}
    </ScrollView>
  );
}