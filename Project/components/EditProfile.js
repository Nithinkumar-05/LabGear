import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, updateDoc, serverTimestamp, doc, getDoc,firestore } from 'firebase/firestore';
import { labsRef, usersRef } from '@/firebaseConfig';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import useLabDetails from '@/utils/LabDetails';
import { useAuth } from '@/routes/AuthContext';

const EditProfile = () => {
  const { labs, loading, error, refreshLabs } = useLabDetails();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    personal: {
      name: user.personal.name || '',
      email: user.personal.email || '',
      phone: user.personal.phone || '',
      dob: user.personal.dob || '',
    },
    professional: {
      department: user.professional.department || 'CSE',
      designation: user.professional.designation || '',
      empId: user.professional.empId || '',
    },
    labdetails: {
      labId: user.professional.labdetails || '',
    },
    imageUrl: user.imageUrl || '',
  });

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [labName, setLabName] = useState(''); // to store the lab name

  // Fetch lab details based on the labId from user
  useEffect(() => {
    if (formData.labdetails.labId) {
      const fetchLabDetails = async () => {
        const labRef = doc(labsRef, formData.labdetails.labId.split('/')[2]);
        const labDoc = await getDoc(labRef);
        if (labDoc.exists()) {
          const labData = labDoc.data();
          setLabName(labData.labname); // Set the lab name
        }
      };

      fetchLabDetails();
    }
  }, [formData.labdetails.labId]);
  
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        handleInputChange('personal', 'imageUrl', result.assets[0].uri);
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
      // Ensure we have valid document IDs
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      if (!formData.labdetails.labId) {
        throw new Error('No lab selected');
      }
  
      // Create document references
      const userDocRef = doc(usersRef, user.uid); // Use Firebase auth UID
      const labDocRef = doc(labsRef, formData.labdetails.labId);
  
      const updateData = {
        personal: {
          name: formData.personal.name,
          email: formData.personal.email,
          phone: formData.personal.phone,
          dob: formData.personal.dob,
          imageUrl: formData.personal.imageUrl||"https://via.placeholder.com/150",
        },
        professional: {
          department: formData.professional.department,
          designation: formData.professional.designation,
          empId: formData.professional.empId,
        },
        labdetails: {
          labRef: labDocRef,
          labName: labName,
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
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full rounded-xl" />
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
              selectedValue={formData.labdetails.labId}
              onValueChange={(value) => handleInputChange('labdetails', 'labId', value)}
              style={{
                color: errors['labdetails.labId'] ? '#ef4444' : '#374151',
              }}
            >
              <Picker.Item label={labName || "Select Lab"} value="" />
              {labs.map((lab) => (
                <Picker.Item key={lab.id} label={`${lab.labname} (${lab.department}) - ${lab.location}`} value={lab.id} />
              ))}
            </Picker>
          </View>
          {renderError('labdetails.labId')}
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
