import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, updateDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { labsRef, usersRef } from '@/firebaseConfig';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import useLabDetails from '@/utils/LabDetails';
import { useAuth } from '@/routes/AuthContext';
import { PROFILE_UPLOAD_PRESET, CLOUD_NAME } from "@env";
import Cloudinary from '@/utils/Cloudinary';
const EditProfile = () => {
  const { labs, loading, error, refreshLabs } = useLabDetails();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    personal: {
      name: user.personal?.name || '',
      email: user.personal?.email || '',
      phone: user.personal?.phone || '',
      dob: user.personal?.dob || '',
      profileImgUrl:user.personal?.profileImgUrl || '',
    },
    professional: {
      department: user.professional?.department || 'CSE',
      designation: user.professional?.designation || '',
      empId: user.professional?.empId || '',
    },
    selectedLabId: '', // Store just the lab ID
  });

  const [currentLab, setCurrentLab] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch and set initial lab details
  useEffect(() => {
    const fetchCurrentLab = async () => {
      if (user.labDetails?._key?.path?.segments) {
        try {
          // Extract lab ID from the path segments
          const labId = user.labDetails._key.path.segments[user.labDetails._key.path.segments.length - 1];
          const labDoc = await getDoc(doc(labsRef, labId));
          
          if (labDoc.exists()) {
            const labData = labDoc.data();
            setCurrentLab({ id: labId, ...labData });
            setFormData(prev => ({
              ...prev,
              selectedLabId: labId
            }));
          }
        } catch (error) {
          console.error('Error fetching current lab:', error);
        }
      }
    };

    fetchCurrentLab();
  }, [user.labDetails]);


  const handleInputChange = (section, field, value) => {
    if (section === 'lab') {
      setFormData(prev => ({
        ...prev,
        selectedLabId: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
    
    setErrors(prev => ({
      ...prev,
      [`${section}.${field}`]: null,
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images','livePhotos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1.0,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        handleInputChange('personal', 'profileImgUrl', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Error picking image:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.personal.name.trim()) {
      newErrors['personal.name'] = 'Name is required';
    }
    if (!formData.selectedLabId) {
      newErrors['lab'] = 'Please select a lab';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }
  
    setUploading(true);
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      const userDocRef = doc(usersRef, user.uid);
      const labDocRef = doc(labsRef, formData.selectedLabId);

      // Verify lab exists before updating
      const labDoc = await getDoc(labDocRef);
      if (!labDoc.exists()) {
        throw new Error('Selected lab does not exist');
      }
      const imgURL = await Cloudinary.uploadImageToCloudinary(formData.personal.profileImgUrl,CLOUD_NAME,PROFILE_UPLOAD_PRESET);
      const updateData = {
        personal: {
          ...formData.personal,
          profileImgUrl: imgURL || "https://via.placeholder.com/150",
        },
        professional: formData.professional,
        labDetails: {
          labId:formData.selectedLabId,
          labRef: labDocRef,
        },
        updatedAt: serverTimestamp(),
      };
  
      await updateDoc(userDocRef, updateData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
      console.error('Update error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const renderError = (field) => {
    return errors[field] ? (
      <Text className="text-red-500 text-sm mt-1">{errors[field]}</Text>
    ) : null;
  };

  const renderInput = (section, field, placeholder, keyboardType = 'default') => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {placeholder}
      </Text>
      <TextInput
        placeholder={`Enter ${placeholder.toLowerCase()}`}
        value={formData[section][field]}
        onChangeText={(value) => handleInputChange(section, field, value)}
        keyboardType={keyboardType}
        className={`bg-white border ${
          errors[`${section}.${field}`] ? 'border-red-500' : 'border-gray-200'
        } p-4 rounded-xl shadow-sm`}
      />
      {renderError(`${section}.${field}`)}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading lab details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 mb-4">Failed to load lab details</Text>
        <TouchableOpacity 
          onPress={refreshLabs}
          className="bg-blue-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Edit Profile
        </Text>

        {/* Image Upload Section */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={pickImage}
            className={`w-48 h-48 bg-white rounded-xl shadow-lg items-center justify-center border-2 border-dashed ${
              errors.image ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {image || formData.personal.profileImgUrl ? (
              <Image 
                source={{ uri: image || formData.personal.profileImgUrl }} 
                className="w-full h-full rounded-xl" 
              />
            ) : (
              <View className="items-center">
                <Text className="text-gray-500 mt-2 text-sm">Tap to upload image</Text>
              </View>
            )}
          </TouchableOpacity>
          {renderError('image')}
        </View>

        {/* Personal Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">Personal Information</Text>
          {renderInput('personal', 'name', 'Full Name')}
          {renderInput('personal', 'email', 'Email', 'email-address')}
          {renderInput('personal', 'phone', 'Phone Number', 'phone-pad')}
          {renderInput('personal', 'dob', 'Date of Birth (DD/MM/YYYY)')}
        </View>

        {/* Professional Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">Professional Information</Text>
          {renderInput('professional', 'department', 'Department')}
          {renderInput('professional', 'designation', 'Designation')}
          {renderInput('professional', 'empId', 'Employee ID')}
        </View>

        {/* Lab Details */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">Lab Details</Text>
          <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <Picker
              selectedValue={formData.selectedLabId}
              onValueChange={(value) => handleInputChange('lab', 'selectedLabId', value)}
              style={{
                color: errors.lab ? '#ef4444' : '#374151',
              }}
            >
              {currentLab ? (
                <Picker.Item 
                  label={`Current: ${currentLab.labName} (${currentLab.department}) - ${currentLab.location}`} 
                  value={currentLab.id} 
                />
              ) : (
                <Picker.Item label="Select Lab" value="" />
              )}
              {labs.map((lab) => (
                <Picker.Item 
                  key={lab.id} 
                  label={`${lab.labName} (${lab.department}) - ${lab.location}`} 
                  value={lab.id} 
                />
              ))}
            </Picker>
          </View>
          {renderError('lab')}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={uploading}
          className={`p-4 rounded-xl shadow-lg mt-4 ${uploading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {uploading ? 'Saving Profile...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfile;