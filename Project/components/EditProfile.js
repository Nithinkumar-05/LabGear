import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native-paper';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      dob: '',
    },
    professional: {
      department: '',
      designation: '',
      empId: '',
    },
    labdetails: {
      labs: ['LAB0001'], // Default lab
    },
    imageUrl: '', // Added image URL field
  });

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'livePhotos'],
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleInputChange('personal', 'imageUrl', result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);

    // Perform API request here
    console.log(formData);

    setUploading(false);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">

        {/* Image Upload Section */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={pickImage}
            className="w-48 h-48 bg-white rounded-xl shadow-black shadow-lg items-center justify-center border-2 border-dashed border-gray-300"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full rounded-xl"
              />
            ) : (
              <View className="items-center">
                <Text className="text-gray-500 mt-2 text-sm">Tap to upload image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">Personal Information</Text>

          <View className="space-y-4">
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>

              <TextInput
                placeholder="Enter full name"
                value={formData.personal.name}
                onChangeText={(value) => handleInputChange('personal', 'name', value)}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>

              <TextInput
                placeholder="Enter email id"
                value={formData.personal.email}
                onChangeText={(value) => handleInputChange('personal', 'email', value)}
                keyboardType="email-address"
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>

              <TextInput
                placeholder="Enter phone number"
                value={formData.personal.phone}
                onChangeText={(value) => handleInputChange('personal', 'phone', value)}
                keyboardType="phone-pad"
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Date of Birth</Text>

              <TextInput
                placeholder="Enter Date of Birth (DD/MM/YYYY)"
                value={formData.personal.dob}
                onChangeText={(value) => handleInputChange('personal', 'dob', value)}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
          </View>
        </View>

        {/* Professional Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">Professional Information</Text>

          <View className="space-y-4">
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Department</Text>

              <TextInput
                placeholder="Enter department"
                value={formData.professional.department}
                onChangeText={(value) => handleInputChange('professional', 'department', value)}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Designation</Text>

              <TextInput
                placeholder="Enter designation"
                value={formData.professional.designation}
                onChangeText={(value) => handleInputChange('professional', 'designation', value)}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Employee Id</Text>

              <TextInput
                placeholder="Enter employee id"
                value={formData.professional.empId}
                onChangeText={(value) => handleInputChange('professional', 'empId', value)}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              />
            </View>
          </View>
        </View>

        {/* Lab Details */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">Lab Details</Text>
          <Text className="text-sm font-medium text-gray-700 mb-1">Lab Name</Text>
          <TextInput
            placeholder="Lab ID"
            value={formData.labdetails.labs[0]}
            editable={false}
            className="bg-gray-100 border border-gray-200 p-4 rounded-xl shadow-sm"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className={`p-4 rounded-xl shadow-black shadow-lg mt-4 ${uploading ? "bg-gray-400" : "bg-blue-500"}`}
          disabled={uploading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {uploading ? "Updating" : "Update"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}