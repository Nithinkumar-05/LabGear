import React, { useRef, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Animated } from "react-native";
import { useAuth } from "@/routes/AuthContext";
import { Avatar, Text, Button, Surface, Divider } from "react-native-paper";

export default function Profile() {

  const userData = {
    personal: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "15 Jan 1990",
    },
    professional: {
      empId: "EMP123456",
      designation: "Senior Research Assistant",
      department: "Biotechnology",
      joinDate: "01 Mar 2023",
    },
    labDetails: {
      labName: "Molecular Biology Lab",
      location: "Building B, Floor 3, Room 304",
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Profile Header */}
      <View className="bg-gray-50 py-6 items-center">
        <View className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden">
          <Image
            source={{ uri: 'https://via.placeholder.com/96' }}
            className="w-full h-full"
          />
        </View>
        <Text className="text-xl font-bold text-gray-900">{userData.personal.name}</Text>
        <Text className="text-base text-gray-600 mt-1">{userData.professional.designation}</Text>

        <TouchableOpacity
          className="mt-4 flex-row items-center bg-white px-4 py-2 rounded-full shadow-sm"
          onPress={() => navigation.navigate('EditProfile')}
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
        value={userData.personal.email}
      />
      <ProfileSection
        iconName="phone"
        title="Phone"
        value={userData.personal.phone}
      />
      <ProfileSection
        iconName="cake"
        title="Date of Birth"
        value={userData.personal.dateOfBirth}
      />

      {/* Professional Information */}
      <SectionTitle title="PROFESSIONAL DETAILS" />
      <ProfileSection
        iconName="badge"
        title="Employee ID"
        value={userData.professional.empId}
      />
      <ProfileSection
        iconName="work"
        title="Designation"
        value={userData.professional.designation}
      />
      <ProfileSection
        iconName="business"
        title="Department"
        value={userData.professional.department}
      />
      <ProfileSection
        iconName="event"
        title="Join Date"
        value={userData.professional.joinDate}
      />

      {/* Lab Details */}
      <SectionTitle title="LAB DETAILS" />
      <ProfileSection
        iconName="science"
        title="Lab Name"
        value={userData.labDetails.labName}
      />
      <ProfileSection
        iconName="location-on"
        title="Location"
        value={userData.labDetails.location}
      />



      <View className="h-8" /> {/* Bottom spacing */}
    </ScrollView>
  );
}