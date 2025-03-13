import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter } from "expo-router";

const LabCard = ({ lab, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
    >
        <View className="flex-row items-center justify-between">
            <View className="flex-1">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center">
                        <MaterialCommunityIcons name="desktop-tower-monitor" size={24} color="#3B82F6" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-lg font-semibold text-gray-900">{lab.labName}</Text>
                        <Text className="text-sm text-gray-500">{lab.department}</Text>
                    </View>
                </View>

                <View className="mt-4 space-y-2">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-2">{lab.location}</Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="account-group" size={16} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">
                                {lab.programmers?.length || 0} Programmers
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="desktop-classic" size={16} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">
                                {lab.systems || 0} Systems
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center"
                onPress={onPress}
            >
                <Feather name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

const AddLabModal = ({ visible, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        labName: '',
        department: '',
        location: '',
        equipment: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.labName || !formData.department || !formData.location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const newLab = {
                ...formData,
                systems: parseInt(formData.systems) || 0,
                programmers: [],
                createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'labs'), newLab);
            onSubmit();
            setFormData({
                labName: '',
                department: '',
                location: '',
                systems: '',
                description: ''
            });
        } catch (error) {
            console.error('Error adding lab:', error);
            Alert.alert('Error', 'Failed to add new lab');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-2"
                        >
                            <Feather name="x" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">Add New Lab</Text>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className="bg-blue-500 px-4 py-2 rounded-lg"
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-medium">Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <ScrollView className="p-4">
                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Lab Name *</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
                                    <MaterialCommunityIcons name="desktop-tower-monitor" size={20} color="#6B7280" />
                                    <TextInput
                                        value={formData.labName}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, labName: text }))}
                                        placeholder="Enter lab name"
                                        className="flex-1 p-3 text-gray-900"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Department *</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
                                    <MaterialCommunityIcons name="office-building" size={20} color="#6B7280" />
                                    <TextInput
                                        value={formData.department}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
                                        placeholder="Enter department name"
                                        className="flex-1 p-3 text-gray-900"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Location *</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
                                    <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
                                    <TextInput
                                        value={formData.location}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                                        placeholder="Enter lab location"
                                        className="flex-1 p-3 text-gray-900"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Number of Systems</Text>
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-3 border border-gray-200">
                                    <MaterialCommunityIcons name="desktop-classic" size={20} color="#6B7280" />
                                    <TextInput
                                        value={formData.systems}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, systems: text }))}
                                        placeholder="Enter number of systems"
                                        keyboardType="numeric"
                                        className="flex-1 p-3 text-gray-900"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Description (Optional)</Text>
                                <View className="bg-gray-50 rounded-xl px-3 border border-gray-200">
                                    <TextInput
                                        value={formData.description}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                        placeholder="Enter lab description"
                                        multiline
                                        numberOfLines={4}
                                        className="p-3 text-gray-900"
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default function LabData() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchLabs = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "labs"));
            const labsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLabs(labsData);
        } catch (error) {
            console.error("Error fetching labs:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLabs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLabs();
    };

    const handleLabPress = (lab) => {
        router.push({
            pathname: "/(admin)/labdetails",
            params: { labId: lab.id }
        });
    };

    const handleAddLab = () => {
        fetchLabs(); // Refresh the list
        setShowAddModal(false);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 mt-4">Loading labs...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white">
                {/* Title Section */}
                <View className="px-6 pt-4 pb-3 border-b border-gray-100">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">Labs</Text>
                            <Text className="text-sm text-gray-500 mt-1">
                                {labs.length} {labs.length === 1 ? 'lab' : 'labs'} available
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            className="bg-blue-500 px-4 py-2.5 rounded-xl flex-row items-center shadow-sm active:bg-blue-600"
                        >
                            <Feather name="plus" size={18} color="white" />
                            <Text className="text-white font-medium ml-2">New Lab</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="py-3 px-4"
                >
                    <View className="flex-row space-x-3">
                        <View className="bg-blue-50 px-4 py-2 rounded-xl flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                                <MaterialCommunityIcons name="desktop-tower-monitor" size={16} color="#3B82F6" />
                            </View>
                            <View className="ml-2">
                                <Text className="text-xs text-blue-600">Total Systems</Text>
                                <Text className="text-base font-semibold text-blue-900">
                                    {labs.reduce((sum, lab) => sum + (lab.systems || 0), 0)}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-purple-50 px-4 py-2 rounded-xl flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                                <MaterialCommunityIcons name="account-group" size={16} color="#8B5CF6" />
                            </View>
                            <View className="ml-2">
                                <Text className="text-xs text-purple-600">Programmers</Text>
                                <Text className="text-base font-semibold text-purple-900">
                                    {labs.reduce((sum, lab) => sum + (lab.programmers?.length || 0), 0)}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-green-50 px-4 py-2 rounded-xl flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                                <MaterialCommunityIcons name="office-building" size={16} color="#10B981" />
                            </View>
                            <View className="ml-2">
                                <Text className="text-xs text-green-600">Departments</Text>
                                <Text className="text-base font-semibold text-green-900">
                                    {new Set(labs.map(lab => lab.department)).size}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Lab List */}
            <ScrollView
                className="flex-1 p-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {labs.length > 0 ? (
                    labs.map(lab => (
                        <LabCard
                            key={lab.id}
                            lab={lab}
                            onPress={() => handleLabPress(lab)}
                        />
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center py-20">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <MaterialCommunityIcons name="desktop-tower-monitor" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-600 text-lg font-medium">No Labs Found</Text>
                        <Text className="text-gray-500 text-center mt-2">
                            Start by adding a new lab using the plus button above
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Lab Modal */}
            <AddLabModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddLab}
            />
        </SafeAreaView>
    );
}