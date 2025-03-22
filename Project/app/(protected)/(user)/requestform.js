import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { doc, getDocs, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { componentsRef, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRefresh } from '@/routes/RefreshContext';

// Enhanced Input Component
const Input = ({ label, value, onChangeText, placeholder, error, multiline, icon }) => (
    <View className="mb-5">
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
        <View className={`flex-row items-center bg-white rounded-xl border ${error ? 'border-red-400' : 'border-gray-100'} overflow-hidden`}>
            {icon && (
                <View className="pl-4 pr-2">
                    <Feather name={icon} size={20} color="#6B7280" />
                </View>
            )}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                className={`flex-1 p-4 text-gray-700 ${multiline ? 'min-h-[120px]' : ''}`}
                placeholderTextColor="#9CA3AF"
            />
        </View>
        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
);

// Enhanced Quick Add Item Component
const QuickAddItem = ({ item, onSelect, isSelected }) => (
    <TouchableOpacity
        onPress={() => onSelect(item)}
        className={`p-4 rounded-xl mr-3 min-w-[150px] ${isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-100'
            }`}
    >
        <View className="flex-row items-center mb-2">
            <View className={`w-8 h-8 rounded-full ${isSelected ? 'bg-blue-100' : 'bg-gray-100'} items-center justify-center`}>
                <Feather name="box" size={16} color={isSelected ? "#3B82F6" : "#6B7280"} />
            </View>
            {isSelected && (
                <View className="absolute right-0 top-0">
                    <Feather name="check-circle" size={16} color="#3B82F6" />
                </View>
            )}
        </View>
        <Text className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{item.name}</Text>
        <Text className={`text-xs mt-1 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`}>{item.type}</Text>
    </TouchableOpacity>
);

const NewRequestForm = () => {
    const [loading, setLoading] = useState(false);
    const [availableItems, setAvailableItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        neededBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    });

    // Replace AsyncStorage states with RefreshContext
    const { data } = useRefresh();
    const { user, lab } = data;

    // Fetch available items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "components"));
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableItems(items);
            } catch (error) {
                Alert.alert("Error", "Failed to load items");
            }
        };
        fetchItems();
    }, []);

    // Filter items based on search
    const filteredItems = availableItems.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Handle item selection
    const handleItemSelect = (item) => {
        if (!selectedItems.find(i => i.id === item.id)) {
            setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
        }
    };

    // Update item quantity
    const updateQuantity = (itemId, newQuantity) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === itemId ? { ...item, quantity: parseInt(newQuantity) || 0 } : item
        ));
    };

    // Remove item
    const removeItem = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item.id !== itemId));
    };

    // Update handleSubmit function
    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert("Error", "Please enter a title for your request");
            return;
        }

        if (selectedItems.length === 0) {
            Alert.alert("Error", "Please add at least one item");
            return;
        }

        if (!user || !lab) {
            Alert.alert("Error", "User or lab data not found");
            return;
        }

        setLoading(true);
        try {
            // Format equipment array
            const equipment = selectedItems.map(item => ({
                equipmentId: item.id,
                name: item.name,
                quantity: item.quantity,
                type: item.type,
                img: item.imageUrl || '',
            }));

            // Create request document
            const requestData = {
                createdAt: serverTimestamp(),
                approvedAt: null,
                equipment,
                lab: {
                    department: lab.department,
                    id: lab.id,
                    labName: lab.labName,
                    location: lab.location,
                },
                labId: lab.id,
                status: 'pending',
                userId: user.uid,
                username: user.personal.name,
                title: formData.title,
                description: formData.description || '',
            };

            console.log(requestData);
            // Add document to Requests collection
            const requestsRef = collection(db, 'Requests');
            await addDoc(requestsRef, requestData);

            Alert.alert(
                "Success",
                "Your request has been submitted successfully",
                [{ text: "OK", onPress: () => router.replace("/") }]
            );
        } catch (error) {
            console.error('Error submitting request:', error);
            Alert.alert("Error", "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Loading state using context data
    if (!user || !lab) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <View className="flex-row items-center">
                    <Feather name="loader" size={24} color="#3B82F6" className="animate-spin mr-2" />
                    <Text className="text-gray-600 font-medium">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}


            <ScrollView className="flex-1">
                {/* Basic Info Section */}
                <View className="p-6 bg-white mb-4">
                    <Input
                        label="Request Title"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        placeholder="What are you requesting?"
                        icon="edit-3"
                    />

                    <Input
                        label="Description"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Add any additional details like technical specifications required."
                        multiline
                        icon="align-left"
                    />
                </View>

                {/* Items Section */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-900">Items</Text>
                        <Text className="text-sm text-gray-500">{selectedItems.length} selected</Text>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white rounded-xl border border-gray-100 mb-4 flex-row items-center px-4">
                        <Feather name="search" size={20} color="#6B7280" />
                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search available items..."
                            className="flex-1 p-4 text-gray-700"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Quick Add Items */}
                    {searchText && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4 -mx-6 px-6"
                        >
                            {filteredItems.map(item => (
                                <QuickAddItem
                                    key={item.id}
                                    item={item}
                                    onSelect={handleItemSelect}
                                    isSelected={selectedItems.some(i => i.id === item.id)}
                                />
                            ))}
                        </ScrollView>
                    )}

                    {/* Selected Items */}
                    <View className="bg-white rounded-xl overflow-hidden shadow-sm">
                        {selectedItems.map((item, index) => (
                            <View
                                key={item.id}
                                className={`p-4 flex-row items-center ${index !== selectedItems.length - 1 ? 'border-b border-gray-50' : ''
                                    }`}
                            >
                                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                                    <Feather name="box" size={18} color="#3B82F6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium text-gray-900">{item.name}</Text>
                                    <Text className="text-gray-500 text-sm">{item.type}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="bg-gray-50 rounded-lg flex-row items-center mr-2">
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="p-2"
                                        >
                                            <Feather name="minus" size={18} color="#6B7280" />
                                        </TouchableOpacity>
                                        <TextInput
                                            value={item.quantity.toString()}
                                            onChangeText={(text) => updateQuantity(item.id, text)}
                                            keyboardType="numeric"
                                            className="w-12 text-center font-medium"
                                        />
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2"
                                        >
                                            <Feather name="plus" size={18} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeItem(item.id)}
                                        className="p-2 bg-red-50 rounded-full"
                                    >
                                        <Feather name="trash-2" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {selectedItems.length === 0 && (
                            <View className="py-8 items-center">
                                <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-3">
                                    <Feather name="shopping-cart" size={24} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-500 text-center">No items added yet</Text>
                                <Text className="text-gray-400 text-sm text-center mt-1">
                                    Search and add items from above
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Submit Button */}
            <View className="bg-white px-6 py-4 border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-4 rounded-xl ${loading ? 'bg-blue-300' : 'bg-blue-500'} flex-row items-center justify-center`}
                >
                    {loading ? (
                        <View className="flex-row items-center">
                            <Feather name="loader" size={20} color="white" className="animate-spin mr-2" />
                            <Text className="text-white font-medium">Submitting...</Text>
                        </View>
                    ) : (
                        <View className="flex-row items-center">
                            <Text className="text-white font-medium mr-2">Submit Request</Text>
                            <Feather name="arrow-right" size={20} color="white" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default NewRequestForm;