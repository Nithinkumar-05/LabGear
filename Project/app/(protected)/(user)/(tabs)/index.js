import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator } from 'react-native';
import { useAuth } from '@/routes/AuthContext';
import { componentsRef, requestsRef } from '@/firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons';
import EquipmentSection from '@/components/EquipmentSection';
import { useRouter } from 'expo-router';

const Home = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('available');
    const [equipment, setEquipment] = useState({ consumable: [], nonConsumable: [] });
    const [requests, setRequests] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchEquipment();
        if (user?.uid) fetchRequests();
    }, [user]);

    const fetchEquipment = async () => {
        try {
            const equipmentSnap = await getDocs(componentsRef);
            const items = equipmentSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setEquipment({
                consumable: items.filter(item => item.type === 'consumable'),
                nonConsumable: items.filter(item => item.type === 'non-consumable')
            });
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const q = query(requestsRef, where('userId', '==', user.uid));
            const requestSnap = await getDocs(q);
            setRequests(requestSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleRequestPress = (request) => {
        router.push({
            pathname: "/(user)/requestsummary",
            params: { requestId: request.id }
        });
    };

    // Cart management functions remain the same
    const addToCart = (item) => {
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            setCart(cart.map(i =>
                i.id === item.id
                    ? { ...i, quantity: Math.min(item.quantity, i.quantity + 1) }
                    : i
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const updateCartQuantity = (itemId, increment) => {
        setCart(cart.map(item => {
            if (item.id === itemId) {
                const maxQuantity = [...equipment.consumable, ...equipment.nonConsumable]
                    .find(e => e.id === itemId).quantity;
                const newQuantity = increment
                    ? Math.min(item.quantity + 1, maxQuantity)
                    : Math.max(1, item.quantity - 1);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const submitRequest = async () => {
        if (cart.length === 0) return;

        try {
            const requestData = {
                userId: user.uid,
                username: user.personal.name, // Updated to use new user structure
                equipment: cart.map(item => ({
                    equipmentId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    type: item.type
                })),
                status: 'pending',
                createdAt: serverTimestamp(),
            };

            await addDoc(requestsRef, requestData);
            setCart([]);
            setShowCart(false);
            fetchRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-6">
                <View className="flex-col">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">
                                Welcome, {user?.personal?.name || 'User'} {/* Updated to use new user structure */}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1">
                                {user?.professional?.designation || 'Lab Programmer'} {/* Updated to use new user structure */}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Rest of the component remains the same */}
            <View className="flex-row bg-white border-b border-gray-200">
                <TouchableOpacity
                    className={`flex-1 py-4 items-center ${activeTab === 'available' ? 'border-b-2 border-blue-500' : ''}`}
                    onPress={() => setActiveTab('available')}
                >
                    <Text className={activeTab === 'available' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                        Available Equipment
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-4 items-center ${activeTab === 'requests' ? 'border-b-2 border-blue-500' : ''}`}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text className={activeTab === 'requests' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                        My Requests
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {activeTab === 'available' ? (

                    <View>
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="relative p-3 bg-blue-600 rounded-full shadow-lg"
                                onPress={() => setShowCart(true)}
                            >
                                <AntDesign name="shoppingcart" size={24} color={"#fff"} />

                                {cart.length > 0 && (
                                    <View className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                        <Text className="text-white text-xs font-bold">{cart.length}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <EquipmentSection
                            title="Non-Consumable Equipment"
                            items={equipment.nonConsumable}
                            addToCart={addToCart}
                        />
                        <EquipmentSection
                            title="Consumable Equipment"
                            items={equipment.consumable}
                            addToCart={addToCart}
                        />
                    </View>
                ) : (
                    <View className="space-y-4">
                        {requests && requests.length > 0 ? (
                            requests.map((request) => (
                                <TouchableOpacity
                                    key={request.id}
                                    className="bg-white p-4 rounded-lg shadow mb-2"
                                    onPress={() => handleRequestPress(request)}
                                >
                                    <View className="space-y-2">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-lg font-semibold">
                                                Request #{request.id.slice(0, 6)}
                                            </Text>
                                            <View className={`px-3 py-1 rounded-full ${request.status === 'approved' ? 'bg-green-100' : 'bg-yellow-100'
                                                }`}>
                                                <Text className={`text-sm font-medium ${request.status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                                                    }`}>
                                                    {request.status}
                                                </Text>
                                            </View>
                                        </View>
                                        {request.equipment.map((item, index) => (
                                            <Text key={index} className="text-gray-600">
                                                {item.name} - Qty: {item.quantity} ({item.type})
                                            </Text>
                                        ))}
                                        <Text className="text-sm text-gray-500">
                                            Requested: {new Date(request.createdAt?.toDate()).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="flex-1 justify-center items-center py-4">
                                <Text className="text-gray-500">No requests available</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <Modal visible={showCart} transparent animationType="slide">
                <View className="flex-1 justify-end">
                    <View className="bg-white p-6 rounded-t-3xl shadow-lg">
                        <Text className="text-xl font-bold mb-4">Request Cart</Text>
                        {
                            cart.length == 0 ? <Text>No Equipment is selected</Text>
                                : (
                                    <ScrollView className="max-h-96">
                                        {cart.map((item) => (
                                            <View key={item.id} className="flex-row items-center justify-between py-2 border-b border-gray-200">
                                                <View>
                                                    <Text className="font-medium">{item.name}</Text>
                                                    <Text className="text-sm text-gray-500">{item.type}</Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <TouchableOpacity
                                                        className="bg-gray-200 p-2 rounded-lg"
                                                        onPress={() => updateCartQuantity(item.id, false)}
                                                    >
                                                        <Text className="font-bold">-</Text>
                                                    </TouchableOpacity>
                                                    <Text className="mx-4">{item.quantity}</Text>
                                                    <TouchableOpacity
                                                        className="bg-gray-200 p-2 rounded-lg"
                                                        onPress={() => updateCartQuantity(item.id, true)}
                                                    >
                                                        <Text className="font-bold">+</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        className="ml-4 bg-red-100 p-2 rounded-lg"
                                                        onPress={() => removeFromCart(item.id)}
                                                    >
                                                        <Text className="text-red-500">Remove</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )
                        }

                        <View className="flex-row gap-2 mt-4">

                            <TouchableOpacity
                                className="flex-1 bg-gray-200 p-4 rounded-lg"
                                onPress={() => setShowCart(false)}
                            >
                                <Text className="text-center font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-500 p-4 rounded-lg disabled:opacity-50"
                                onPress={submitRequest}
                                disabled={cart.length === 0}
                            >
                                <Text className="text-center text-white font-medium">Submit Request</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Home;