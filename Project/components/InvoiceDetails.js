import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, Modal } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Cloudinary from '@/utils/Cloudinary';

const InvoiceDetails = ({ requestData }) => {
    const router = useRouter();
    const [equipmentExpenses, setEquipmentExpenses] = useState(
        requestData.equipment?.map(item => ({
            ...item,
            amountSpent: item.amountSpent?.toString() || '',
            estimatedUnitPrice: item.estimatedUnitPrice || 0,
            approvedQuantity: item.approvedQuantity || 0,
            visited: false,
            name: item.name || 'Unnamed Item'
        })) || []
    );
    const [invoices, setInvoices] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [tempSelectedItems, setTempSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);


    // Memoized calculations for totals
    const totals = useMemo(() => {
        const totalApproved = equipmentExpenses.reduce((sum, item) => 
            sum + ((item.approvedQuantity || 0) * (item.estimatedUnitPrice || 0)), 0);
        
        const totalSpent = equipmentExpenses.reduce((sum, item) => 
            sum + (parseFloat(item.amountSpent) || 0), 0);
        
        const unitCosts = equipmentExpenses.map(item => ({
            name: item.name || 'Unnamed Item',
            approvedUnitPrice: item.estimatedUnitPrice || 0,
            actualUnitCost: item.approvedQuantity 
                ? (parseFloat(item.amountSpent) || 0) / item.approvedQuantity 
                : 0
        }));

        return {
            totalApproved: totalApproved || 0,
            totalSpent: totalSpent || 0,
            unitCosts,
            savings: (totalApproved || 0) - (totalSpent || 0)
        };
    }, [equipmentExpenses]);

    // Error handling for initial render
    if (!requestData?.equipment) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500">Error: No equipment data available</Text>
            </View>
        );
    }

    const formatDate = (dateString) => 
        dateString ? new Date(dateString).toLocaleDateString() : "N/A";

    const formatCurrency = (amount) => 
        `₹${(parseFloat(amount) || 0).toFixed(2)}`;

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]?.uri) {
                setSelectedImage({
                    uri: result.assets[0].uri,
                    items: []
                });
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const toggleItemSelection = (index) => {
        // Prevent selecting items that have already been used in previous invoices
        if (equipmentExpenses[index].visited) {
            Alert.alert("Item Already Used", "This item has been associated with a previous invoice.");
            return;
        }

        setSelectedImage(prev => ({
            ...prev,
            items: prev.items.includes(index) 
                ? prev.items.filter(i => i !== index) 
                : [...prev.items, index]
        }));
    };

    const saveInvoice = () => {
        if (!selectedImage || selectedImage.items.length === 0) {
            Alert.alert("Error", "Please select at least one item");
            return;
        }
        
        // Mark selected items as visited
        const updatedEquipment = [...equipmentExpenses];
        selectedImage.items.forEach(index => {
            updatedEquipment[index].visited = true;
        });
        setEquipmentExpenses(updatedEquipment);
        
        setInvoices(prev => [...prev, {
            id: Date.now(),
            ...selectedImage
        }]);
        
        setSelectedImage(null);
    };


    

    const handleInvoiceSave = () => {
        if (tempSelectedItems.length === 0) {
            Alert.alert("Error", "Please select at least one item");
            return;
        }
        
        // Mark selected items as visited
        const updatedEquipment = [...equipmentExpenses];
        tempSelectedItems.forEach(index => {
            updatedEquipment[index].visited = true;
        });
        setEquipmentExpenses(updatedEquipment);
        
        setInvoices(prev => [...prev, {
            id: Date.now(),
            uri: tempImageUri,
            items: [...tempSelectedItems]
        }]);
        
        setTempImageUri(null);
        setTempSelectedItems([]);
        setShowItemModal(false);
    };

    const removeInvoice = (id) => {
        // When removing an invoice, we need to mark the associated items as unvisited
        const removedInvoice = invoices.find(inv => inv.id === id);
        if (removedInvoice) {
            const updatedEquipment = [...equipmentExpenses];
            removedInvoice.items.forEach(index => {
                updatedEquipment[index].visited = false;
            });
            setEquipmentExpenses(updatedEquipment);
        }

        setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    };

    const updateEquipmentExpense = (index, value) => {
        const updated = [...equipmentExpenses];
        updated[index].amountSpent = value;
        setEquipmentExpenses(updated);
    };

    const uploadInvoices = async () => {
        const uploaded = [];
        for (const invoice of invoices) {
            try {
                const url = await Cloudinary.uploadImageToCloudinary(
                    invoice.uri,
                    process.env.CLOUD_NAME,
                    process.env.INVOICE_UPLOAD_PRESET
                );
                uploaded.push({
                    imageUrl: url,
                    items: invoice.items
                });
            } catch (error) {
                console.error("Upload failed:", error);
                throw error;
            }
        }
        return uploaded;
    };
    const validateForm = () => {
        // Check all equipment expenses are filled
        const missingAmounts = equipmentExpenses
            .some(item => !item.amountSpent || isNaN(parseFloat(item.amountSpent)));
        
        if (missingAmounts) {
            Alert.alert("Error", "Please fill all amount fields");
            return false;
        }

        if (invoices.length === 0) {
            Alert.alert("Error", "Please upload at least one invoice");
            return false;
        }

        // Verify all items are covered in invoices
        const coveredItems = new Set();
        invoices.forEach(invoice => 
            invoice.items.forEach(itemIndex => coveredItems.add(itemIndex))
        );
        
        if (coveredItems.size !== equipmentExpenses.length) {
            Alert.alert("Error", "All items must be associated with an invoice");
            return false;
        }

        return true;
    };

    const saveInvoiceDetails = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const uploadedInvoices = await uploadInvoices();
            
            // Prepare a clean object for Firestore update
            const updateData = {
                equipmentExpenses: equipmentExpenses.map(item => ({
                    name: item.name || 'Unnamed Item',
                    approvedQuantity: item.approvedQuantity || 0,
                    estimatedUnitPrice: item.estimatedUnitPrice || 0,
                    amountSpent: parseFloat(item.amountSpent || 0)
                })),
                invoices: uploadedInvoices.map(invoice => ({
                    imageUrl: invoice.imageUrl || '',
                    items: invoice.items || []
                })),
                status: "completed",
                totalAmountSpent: equipmentExpenses.reduce(
                    (sum, item) => sum + (parseFloat(item.amountSpent) || 0), 0
                ),
                totalApproved: totals.totalApproved || 0,
                completedAt: new Date().toISOString()
            };

            // Remove any undefined values
            Object.keys(updateData).forEach(key => 
                updateData[key] === undefined && delete updateData[key]
            );

            await updateDoc(doc(db, "approvedRequests", requestData.id), updateData);

            Alert.alert("Success", "Data saved successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Save error:", error);
            Alert.alert("Error", `Failed to save data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Read-only view for completed requests
    if (requestData.status === "completed") {
        return (
            <ScrollView className="flex-1 bg-white p-4">
                <View className="mb-6">
                    <Text className="text-xl font-bold">Request Details</Text>
                    <Text>Request #{requestData.requestId?.substring(0, 6)}</Text>
                    <Text>Completed: {formatDate(requestData.completedAt)}</Text>
                </View>

                

                <View className="mb-6">
                    <Text className="text-lg font-bold mb-2">Equipment Expenses</Text>
                    {requestData.equipmentExpenses?.map((item, index) => (
                        <View key={index} className="p-3 mb-2 bg-gray-50 rounded">
                            <Text className="font-medium">{item.name}</Text>
                            <Text>Amount: {formatCurrency(item.amountSpent)}</Text>
                            <Text>Quantity: {item.approvedQuantity}</Text>
                            <Text>Unit Price: {formatCurrency(item.amountSpent / item.approvedQuantity)}</Text>
                        </View>
                    ))}
                </View>

                <View className="mb-6">
                    <Text className="text-lg font-bold mb-2">Invoices</Text>
                    {requestData.invoices?.map((invoice, index) => (
                        <View key={index} className="mb-4">
                            <Image 
                                source={{ uri: invoice.imageUrl }} 
                                className="w-full h-48 rounded-lg"
                                resizeMode="contain"
                            />
                            <Text className="mt-2 font-medium">Associated Items:</Text>
                            {invoice.items.map(itemIndex => (
                                <Text key={itemIndex} className="ml-2 text-gray-600">
                                    - {requestData.equipmentExpenses[itemIndex]?.name}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    }

    // Editable form view
    return (
        <ScrollView className="flex-1 bg-white p-2">
            {/* Totals Summary Card */}
            

            {/* Unit Cost Breakdown */}
            <View className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
                <Text className="text-lg font-bold mb-3">Unit Cost Analysis</Text>
                {totals.unitCosts.map((item, index) => (
                    <View key={index} className="flex-row justify-between mb-2">
                        <Text className="text-gray-700">{item.name}</Text>
                        <View>
                            
                            <Text className="text-right font-bold">
                                : ₹{(item.actualUnitCost || 0).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Equipment Expenses Input */}
            <View className="mb-6">
                <Text className="text-lg font-bold mb-2">Equipment Expenses</Text>
                {equipmentExpenses.map((item, index) => (
                    <View key={index} className="p-3 mb-3 bg-gray-50 rounded-lg">
                        <Text className="font-medium">{item.name}</Text>
                        <Text>Approved Quantity: {item.approvedQuantity}</Text>
                        <TextInput
                            className="border p-2 mt-2 rounded"
                            placeholder="Amount spent"
                            keyboardType="numeric"
                            value={item.amountSpent}
                            onChangeText={v => updateEquipmentExpense(index, v)}
                        />
                    </View>
                ))}
            </View>

            {/* Invoice Upload Section */}
            <View className="mb-6">
                <Text className="text-lg font-bold mb-2">Invoice Images</Text>
                
                <TouchableOpacity
                    onPress={pickImage}
                    className="border-2 border-dashed border-gray-300 p-6 rounded-lg items-center mb-4"
                >
                    <Text className="text-gray-500">+ Upload Invoice Image</Text>
                </TouchableOpacity>

                {invoices.map(invoice => (
                    <View key={invoice.id} className="mb-4">
                        <Image
                            source={{ uri: invoice.uri }}
                            className="w-full h-48 rounded-lg"
                            resizeMode="contain"
                        />
                        <Text className="mt-2">Associated Items:</Text>
                        {invoice.items.map(itemIndex => (
                            <Text key={itemIndex} className="ml-2 text-gray-600">
                                - {equipmentExpenses[itemIndex]?.name}
                            </Text>
                        ))}
                        <TouchableOpacity
                            onPress={() => removeInvoice(invoice.id)}
                            className="bg-red-500 p-2 rounded mt-2"
                        >
                            <Text className="text-white text-center">Remove Invoice</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {selectedImage && (
                <Modal 
                    visible={true} 
                    transparent={true} 
                    animationType="slide"
                    statusBarTranslucent={true}
                >
                    <View className="flex-1 justify-end bg-black bg-opacity-50">
                        <View className="bg-white rounded-t-2xl p-6 max-h-[80%]">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">Select Associated Items</Text>
                                <TouchableOpacity 
                                    onPress={() => setSelectedImage(null)}
                                    className="p-2"
                                >
                                    <Text className="text-red-500">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <Image
                                source={{ uri: selectedImage.uri }}
                                className="w-full h-48 rounded-lg mb-4"
                                resizeMode="contain"
                            />
                            
                            <ScrollView>
                                {equipmentExpenses.map((item, index) => (
                                    !item.visited && (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => toggleItemSelection(index)}
                                            className="flex-row items-center mb-3 p-3 bg-gray-100 rounded-lg gap-3"
                                        >
                                            <View className={`w-6 h-6 border rounded mr-3 items-center justify-center
                                                ${selectedImage.items.includes(index) ? 'border-blue-500' : 'border-gray-300'}`}>
                                                    <View className=''>
                                                        {selectedImage.items.includes(index) && (
                                                            <Text className='text-center font-bold'>✓</Text>
                                                        )}
                                                    </View>
                                                
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-medium">{item.name}</Text>
                                                <Text className="text-gray-500">
                                                    Qty: {item.approvedQuantity} | Est. Price: ₹{(item.estimatedUnitPrice || 0).toFixed(2)}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={saveInvoice}
                                className={`p-4 rounded-lg mt-4 ${selectedImage.items.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                                disabled={selectedImage.items.length === 0}
                            >
                                <Text className={`text-center font-bold ${selectedImage.items.length > 0 ? 'text-white' : 'text-gray-500'}`}>
                                    Save Selection
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
               )}
            {/* Save Button */}
            <TouchableOpacity
                onPress={saveInvoiceDetails}
                disabled={loading}
                className={`p-4 rounded-lg mt-6 mb-8 ${loading ? 'bg-gray-400' : 'bg-green-500'}`}
            >
                <Text className="text-white text-center font-bold">
                    {loading ? "Saving..." : "Save All Details"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default InvoiceDetails;