import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Cloudinary from '@/utils/Cloudinary';

const InvoiceDetails = ({ requestData }) => {
    const router = useRouter();
    
    const [totalAmount, setTotalAmount] = useState('');
    const [invoiceImage, setInvoiceImage] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // If requestData or equipment is undefined, handle it gracefully
    if (!requestData || !requestData.equipment) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500">Error: Invalid request data</Text>
            </View>
        );
    }
    
    // For tracking individual equipment expenses
    const [equipmentExpenses, setEquipmentExpenses] = useState(
        requestData.equipment.map(item => ({
            ...item,
            amountSpent: ''
        }))
    );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "₹0.00";
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images','livePhotos'],  
                allowsEditing: true,
                aspect: [6, 10], 
                quality: 1,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setInvoiceImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick an image. Please try again.");
        }
    };
    
    const updateEquipmentExpense = (index, value) => {
        const updated = [...equipmentExpenses];
        updated[index].amountSpent = value;
        setEquipmentExpenses(updated);
        
        // Calculate total automatically
        const total = updated.reduce((sum, item) => {
            return sum + (parseFloat(item.amountSpent) || 0);
        }, 0);
        
        setTotalAmount(total.toString());
    };

    const uploadInvoiceImage = async () => {
        if (!invoiceImage) return null;
    
        try {
            // Upload to Cloudinary
            const imgUrl = await Cloudinary.uploadImageToCloudinary(
                invoiceImage,
                process.env.CLOUD_NAME,
                process.env.INVOICE_UPLOAD_PRESET
            );
    
            if (!imgUrl) {
                throw new Error("Failed to upload invoice image to Cloudinary");
            }
    
            return imgUrl;
        } catch (error) {
            console.error("Error uploading image: ", error);
            return null;
        }
    };
    
    const saveInvoiceDetails = async () => {
        if (!totalAmount) {
            Alert.alert("Error", "Please enter the total amount spent");
            return;
        }
        
        if (!invoiceImage) {
            Alert.alert("Error", "Please upload an invoice image");
            return;
        }
        
        setLoading(true);
        
        try {
            const invoiceImageUrl = await uploadInvoiceImage();
            
            if (!invoiceImageUrl) {
                throw new Error("Failed to upload invoice image");
            }
            
            const requestRef = doc(db, "approvedRequests", requestData.id);
            
            await updateDoc(requestRef, {
                totalAmountSpent: parseFloat(totalAmount),
                invoiceUrl: invoiceImageUrl,
                equipmentExpenses: equipmentExpenses,
                status: "completed",
                completedAt: new Date().toISOString()
            });
            
            Alert.alert(
                "Success", 
                "Invoice details saved successfully",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Error saving invoice details: ", error);
            Alert.alert("Error", "Failed to save invoice details");
        } finally {
            setLoading(false);
        }
    };

    // Calculate cost per unit for each item
    const calculateCostPerUnit = (item) => {
        if (!item.amountSpent || !item.approvedQuantity) return 0;
        return parseFloat(item.amountSpent) / parseInt(item.approvedQuantity);
    };

    // If the request status is completed, show read-only view
    if (requestData.status === "completed") {
        return (
            <ScrollView className="flex-1 bg-white p-4">
                <View className="mb-6">
                    <Text className="text-xl font-bold mb-2">Request Details</Text>
                    <Text className="text-gray-500">Request #{requestData.requestId.substring(0, 6)}</Text>
                    <Text className="text-gray-500">Approved: {formatDate(requestData.approvedAt)}</Text>
                    <Text className="text-gray-500">Completed: {formatDate(requestData.completedAt)}</Text>
                    <View className="mt-2 py-1 px-2 bg-green-100 self-start rounded">
                        <Text className="text-green-700 font-medium">Completed</Text>
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-lg font-bold mb-2">Equipment</Text>
                    {requestData.equipmentExpenses && requestData.equipmentExpenses.length > 0 ? (
                        requestData.equipmentExpenses.map((item, index) => (
                            <View key={index} className="mb-3 p-3 border border-gray-200 rounded">
                                <Text className="font-medium">{item.name}</Text>
                                <View className="flex-row justify-between mt-1">
                                    <Text className="text-gray-600">Quantity: {item.approvedQuantity || item.quantity}</Text>
                                    <Text className="text-gray-600">Cost per unit: {formatCurrency(calculateCostPerUnit(item))}</Text>
                                </View>
                                <View className="flex-row justify-between mt-1">
                                    <Text className="text-gray-600">Total cost:</Text>
                                    <Text className="font-semibold">{formatCurrency(item.amountSpent)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500">No equipment listed</Text>
                    )}
                </View>

                <View className="mb-6">
                    <Text className="text-lg font-bold mb-2">Invoice Details</Text>
                    <View className="flex-row justify-between bg-gray-100 p-3 rounded mb-3">
                        <Text className="font-bold">Total Amount:</Text>
                        <Text className="font-bold">{formatCurrency(requestData.totalAmountSpent)}</Text>
                    </View>
                    
                    {requestData.invoiceUrl ? (
                        <Image 
                            source={{ uri: requestData.invoiceUrl }} 
                            style={{ width: '100%', height: 200, borderRadius: 10 }} 
                            resizeMode="contain"
                        />
                    ) : (
                        <Text className="text-gray-500">No invoice image uploaded</Text>
                    )}

                </View>

                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="bg-gray-200 py-3 rounded items-center mb-6"
                >
                    <Text className="font-medium">Back to Requests</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    // For non-completed requests, show the form to add invoice details
    return (
        <ScrollView className="flex-1 bg-white p-4">
            <View className="mb-4">
                <Text className="text-xl font-bold mb-2">Request Details</Text>
                <Text className="text-gray-500">Request #{requestData.requestId.substring(0, 6)}</Text>
                <Text className="text-gray-500">Approved: {formatDate(requestData.approvedAt)}</Text>
                <View className="mt-2 py-1 px-2 bg-blue-100 self-start rounded">
                    <Text className="text-blue-700 font-medium">Add Invoice Details</Text>
                </View>
            </View>
            
            {/* Equipment List */}
            <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">Equipment Details</Text>
                
                {equipmentExpenses.map((item, index) => (
                    <View key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="font-medium">{item.name}</Text>
                                <Text className="text-gray-600">Approved Qty: {item.approvedQuantity}</Text>
                            </View>
                        </View>
                        
                        <View className="mt-3">
                            <Text className="text-sm text-gray-600 mb-1">Amount Spent</Text>
                            <TextInput
                                className="border border-gray-300 rounded-md px-2 py-1"
                                keyboardType="numeric"
                                value={item.amountSpent}
                                onChangeText={(value) => updateEquipmentExpense(index, value)}
                                placeholder="0.00"
                            />
                        </View>
                        
                        {item.amountSpent && parseFloat(item.amountSpent) > 0 && item.approvedQuantity > 0 && (
                            <View className="mt-2 flex-row justify-between">
                                <Text className="text-sm text-gray-600">Cost per unit:</Text>
                                <Text className="text-sm font-medium">
                                    {formatCurrency(parseFloat(item.amountSpent) / parseInt(item.approvedQuantity))}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
            
            {/* Total Amount */}
            <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">Total Amount Spent</Text>
                <TextInput
                    className="border border-gray-300 rounded-md p-2"
                    keyboardType="numeric"
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                    placeholder="0.00"
                />
            </View>
            
            {/* Invoice Image */}
            <View className="mb-6">
                <Text className="text-lg font-semibold mb-2">Invoice Image</Text>
                
                <TouchableOpacity 
                    onPress={pickImage}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center justify-center h-40"
                >
                    {invoiceImage ? (
                        <Image source={{ uri: invoiceImage }} className="w-full h-full" resizeMode="contain" />
                    ) : (
                        <Text className="text-gray-400">Tap to upload invoice image</Text>
                    )}
                </TouchableOpacity>
            </View>
            
            {/* Save Button */}
            <TouchableOpacity
                onPress={saveInvoiceDetails}
                disabled={loading}
                className={`rounded-lg p-3 items-center ${loading ? 'bg-gray-400' : 'bg-blue-500'} mb-6`}
            >
                <Text className="text-white font-semibold">
                    {loading ? "Saving..." : "Save Invoice Details"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default InvoiceDetails;