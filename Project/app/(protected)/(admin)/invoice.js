import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, approvedRequestsRef } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

const Invoice = () => {
  const { requestId } = useLocalSearchParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequestData();
  }, [requestId]);

  const fetchRequestData = async () => {
    if (!requestId) {
      setError('Request ID is missing');
      setLoading(false);
      return;
    }

    try {
      const requestDoc = doc(approvedRequestsRef, requestId);
      const requestSnapshot = await getDoc(requestDoc);

      if (requestSnapshot.exists()) {
        setRequest({
          id: requestSnapshot.id,
          ...requestSnapshot.data()
        });
      } else {
        setError('Request not found');
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const openImageInFullScreen = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open the image');
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading invoice details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-gray-700 text-lg mt-4">{error}</Text>
        <TouchableOpacity 
          className="mt-6 bg-blue-500 px-6 py-3 rounded-lg" 
          onPress={handleBackPress}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        {/* Header with back button */}
        <View className="bg-blue-500 p-5">
          
          
          <Text className="text-2xl font-bold text-white">
            Invoice Details
          </Text>
          <Text className="text-base text-blue-100 mt-1">
            Request ID: {requestId}
          </Text>
        </View>

        {/* Request Details Card */}
        <View className="bg-white m-3 p-4 rounded-lg shadow">
          <View className="border-b border-gray-200 pb-3 mb-3">
            <Text className="text-lg font-bold text-gray-800">Request Information</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Status:</Text>
            <View className="bg-green-100 px-2 py-1 rounded">
              <Text className="text-green-700 font-medium">{request?.status || 'N/A'}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Approved Date:</Text>
            <Text className="text-gray-800">{formatDate(request?.approvedAt)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Completed Date:</Text>
            <Text className="text-gray-800">{formatDate(request?.completedAt)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Total Amount:</Text>
            <Text className="text-gray-800 font-bold">₹{request?.totalAmountSpent?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        {/* Equipment Expenses */}
        <View className="bg-white m-3 p-4 rounded-lg shadow">
          <View className="border-b border-gray-200 pb-3 mb-3">
            <Text className="text-lg font-bold text-gray-800">Equipment Expenses</Text>
          </View>
          
          {request?.equipmentExpenses && request.equipmentExpenses.length > 0 ? (
            request.equipmentExpenses.map((item, index) => (
              <View key={index} className="border-b border-gray-100 py-3 flex-row justify-between">
                <View>
                  <Text className="text-gray-800 font-medium">{item.name || 'Unknown Item'}</Text>
                  <Text className="text-gray-500 text-sm">Quantity: {item.approvedQuantity || 0}</Text>
                </View>
                <View>
                  <Text className="text-gray-800 font-bold">₹{item.amountSpent?.toLocaleString() || '0'}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 italic">No equipment expense details available</Text>
          )}
          
          <View className="mt-3 pt-3 border-t border-gray-200 flex-row justify-between">
            <Text className="text-gray-800 font-medium">Total</Text>
            <Text className="text-blue-600 font-bold">₹{request?.totalAmountSpent?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        {/* Invoice Images */}
        <View className="bg-white m-3 p-4 rounded-lg shadow mb-6">
          <View className="border-b border-gray-200 pb-3 mb-3">
            <Text className="text-lg font-bold text-gray-800">Invoice Images</Text>
          </View>
          
          {request?.invoices && request.invoices.length > 0 ? (
            request.invoices.map((invoice, index) => (
              <TouchableOpacity 
                key={index} 
                className="mb-4"
                onPress={() => openImageInFullScreen(invoice.imageUrl)}
              >
                <Text className="text-gray-700 mb-2">Invoice #{index + 1}</Text>
                <Image 
                  source={{ uri: invoice.imageUrl }} 
                  className="w-full h-64 rounded-lg bg-gray-200"
                  resizeMode="contain"
                />
                <Text className="text-blue-500 text-center mt-2">Tap to view full size</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-500 italic">No invoice images available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Invoice;