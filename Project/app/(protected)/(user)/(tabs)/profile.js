import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View, Image, TouchableOpacity, RefreshControl } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/routes/AuthContext";
import { useRouter } from "expo-router";
import CustomBanner from "@/components/Banner";
import Avatar from "@/components/AvatarGenerator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Fixed import
import Loading from "@/components/Loading";
import { Activity } from "lucide-react-native";
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
    <View className="ml-3 flex-1">
      <Text className="text-sm text-gray-500">{title}</Text>
      <Text className="text-base text-gray-900 break-words">{value || "Not provided"}</Text>
    </View>
  </View>
);

export default function Profile() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(user);
  const [lab, setLab] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentLab = useCallback(async () => {
    if (!user?.labDetails?.labId) return;

    try {
      const labDoc = await getDoc(doc(db, "labs", user.labDetails.labId));
      if (labDoc.exists()) {
        setLab({ id: user.labDetails.labId, ...labDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching current lab:", error);
    }
  }, [user?.labDetails?.labId]);

  const fetchUserDetails = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [user?.uid]);

  const checkProfileCompleteness = useCallback(() => {
    if (!user) return false;

    const requiredFields = [
      user.personal?.name,
      user.personal?.email,
      user.personal?.phone,
      user.personal?.dob,
      user.professional?.empId,
      user.professional?.designation,
      user.professional?.department
    ];

    return requiredFields.some(field => !field);
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserDetails(), fetchCurrentLab()]);
    setRefreshing(false);
  }, [fetchUserDetails, fetchCurrentLab]);

  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);
      await Promise.all([fetchUserDetails(), fetchCurrentLab()]);
      setShowBanner(checkProfileCompleteness());
      setIsLoading(false);
    };

    initializeProfile();
  }, [fetchUserDetails, fetchCurrentLab, checkProfileCompleteness]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator animating={true} color="#3182CE" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {showBanner && (
        <CustomBanner
          text="Please complete your profile"
          onPress={() => router.push("(user)/editprofile")}
        />
      )}

      {/* Profile Header */}
      <View className="bg-white py-6 items-center  mb-2">
        <View className="w-24 h-24 rounded-full items-center justify-center bg-gray-200 mb-3 overflow-hidden">
          {userDetails.personal?.profileImgUrl ? (
            <Image
              source={{ uri: userDetails.personal.profileImgUrl }}
              className="w-full h-full"
            // defaultSource={require('@/assets/default-avatar.png')}
            />
          ) : (
            <Avatar
              name={userDetails.personal?.name || "User"}
              size={96}
              fontSize={35}
            />
          )}
        </View>
        <Text className="text-xl font-bold text-gray-900">
          {userDetails.personal?.name || "User"}
        </Text>
        <Text className="text-base text-gray-600 mt-1">
          {userDetails.professional?.designation || "Lab Member"}
        </Text>

        <TouchableOpacity
          className="mt-4 flex-row items-center bg-gray-100 px-4 py-2 rounded-full"
          onPress={() => router.push("(user)/editprofile")}
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
        value={userDetails.personal?.email}
      />
      <ProfileSection
        iconName="phone"
        title="Phone"
        value={userDetails.personal?.phone}
      />
      <ProfileSection
        iconName="cake"
        title="Date of Birth"
        value={userDetails.personal?.dob}
      />

      {/* Professional Information */}
      <SectionTitle title="PROFESSIONAL DETAILS" />
      <ProfileSection
        iconName="badge"
        title="Employee ID"
        value={userDetails.professional?.empId}
      />
      <ProfileSection
        iconName="work"
        title="Designation"
        value={userDetails.professional?.designation}
      />
      <ProfileSection
        iconName="business"
        title="Department"
        value={userDetails.professional?.department || "CSE"}
      />

      {/* Lab Details */}
      <SectionTitle title="LAB DETAILS" />
      <ProfileSection
        iconName="computer"
        title="Lab Details"
        value={lab?.labName}
      />

      <View className="h-8" />
    </ScrollView>
  );
}