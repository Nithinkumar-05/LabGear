import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { usersRef } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useAuth } from '@/routes/AuthContext';
export default function AddUser() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const registerUser = async (email, password, username) => {
    try {
      const adminUser = auth.currentUser;
      if (!adminUser || !adminUser.email) {
        throw new Error("Admin not authenticated");
      }

      const response = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        uid: response.user.uid,
        email: response.user.email,
        emailVerified: response.user.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "user",
        labdetails: "",
        personal: {
          dob: "",
          email: email,
          name: username,
          phone: "",
          profileImgUrl: "",
        },
        professional: {
          department: "CSE",
          designation: "",
          empId: "",
        },
      };
      setLoading(true);
      await setDoc(doc(usersRef, response.user.uid), userData);

      await signOut(auth);

      await signInWithEmailAndPassword(auth, adminUser.email, "admin@123");
      setLoading(false);
      return { success: true, data: userData };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/weak-password)")) msg = "Weak Password";
      if (msg.includes("(auth/email-already-in-use)")) msg = "Email already in use";
      return { success: false, msg };
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill all fields!');
      return;
    }

    setLoading(true);

    const response = await registerUser(
      formData.email.trim(),
      formData.password,
      formData.username
    );

    if (response.success) {
      alert('Successfully added the user');
      setFormData({ username: '', email: '', password: '' }); // Clear form
    } else {
      alert('Failed to add the user');
      setError(response.msg);
    }

    setLoading(false);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Add User</Text>
        {error && <Text className="text-red-600 text-sm">{error}</Text>}

        {/* Username */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
          <TextInput
            placeholder="Enter username"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            placeholder="Enter email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
          />
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
          <TextInput
            placeholder="Enter password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className={`p-4 rounded-xl shadow-black shadow-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? 'Submitting...' : 'Add User'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}