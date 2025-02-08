import { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { db } from "@/firebaseConfig"; 
import { doc, getDoc } from "firebase/firestore";

const RequestDetailsModal = ({ visible, request, onClose }) => {
    const [labDetails, setLabDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabDetails = async () => {
            if (request?.userId) {
                setLoading(true);
                try {
                    
                        const labRef = request.labName; 
        
                        if (labRef) {
                            // Fetch lab document from reference
                            const labSnap = await getDoc(labRef);
                            if (labSnap.exists()) {
                                setLabDetails(labSnap.data());
                            } else {
                                setLabDetails(null);
                            }
                        
                }
             } catch (error) {
                    console.error("Error fetching lab details:", error);
                }
                setLoading(false);
            }
        };
        fetchLabDetails();
    }, [request]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end">
                <View className="bg-white p-6 rounded-t-3xl shadow-lg">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold">Request Details</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <AntDesign name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="max-h-96">
                        <View className="space-y-4">
                            {/* Request Information */}
                            <View className="bg-gray-50 p-4 rounded-lg">
                                <Text className="text-lg font-semibold">
                                    Request #{request?.id?.slice(0, 6)}
                                </Text>
                                <Text className="text-sm text-gray-500 mt-1">
                                    Submitted by: {request?.username}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    Date: {request?.createdAt ? new Date(request.createdAt).toLocaleDateString() : ""}
                                </Text>
                            </View>

                            {/* Equipment Requested */}
                            <View>
                                <Text className="text-lg font-semibold mb-2">Equipment Requested:</Text>
                                {request?.equipment.map((item, index) => (
                                    <View key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                                        <Text className="font-medium">{item.name}</Text>
                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-gray-600">Type: {item.type}</Text>
                                            <Text className="text-gray-600">Quantity: {item.quantity}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Lab Details */}
                            <View className="bg-gray-50 p-4 rounded-lg">
                                <Text className="text-lg font-semibold mb-2">Lab Details</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#0000ff" />
                                ) : labDetails ? (
                                    <View>
                                        <Text className="text-gray-600">Lab Name: {labDetails.labname}</Text>
                                        <Text className="text-gray-600">Department: {labDetails.department}</Text>
                                        <Text className="text-gray-600">Location: {labDetails.location}</Text>
                                    </View>
                                ) : (
                                    <Text className="text-gray-600">No lab details found.</Text>
                                )}
                            </View>

                            {/* Request Status */}
                            <View className="bg-gray-50 p-4 rounded-lg">
                                <Text className="text-lg font-semibold mb-2">Status</Text>
                                <View className={`self-start px-3 py-1 rounded-full ${
                                    request?.status === 'approved' ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                    <Text className={`text-sm font-medium ${
                                        request?.status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                                    }`}>
                                        {request?.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-4" onPress={onClose}>
                        <Text className="text-center text-white font-medium">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default RequestDetailsModal;
