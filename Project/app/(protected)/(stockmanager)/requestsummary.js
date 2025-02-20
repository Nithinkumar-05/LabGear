import React, { useState, useEffect } from "react";
import { requestsRef } from "@/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import RequestDetails from "@/components/RequestDetails";
import { useLocalSearchParams, useRouter } from "expo-router";
import SkeletonLoader from "@/components/SkeletonLoader";
import { View, Text, TouchableOpacity, Alert, Modal } from "react-native";

export default function RequestSummary() {
    const { requestId } = useLocalSearchParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [approved, setApproved] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId) return;
            try {
                const docRef = doc(requestsRef, requestId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const requestData = { id: docSnap.id, ...docSnap.data() };
                    setRequest(requestData);
                    setApproved(requestData.status === "approved");
                } else {
                    Alert.alert("Error", "Request not found.");
                }
            } catch (error) {
                console.error("Error fetching request:", error);
                Alert.alert("Error", "Failed to load request details.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [requestId]);

    const handleApprove = async () => {
        try {
            const docRef = doc(requestsRef, requestId);
            await updateDoc(docRef, {
                status: "approved",
                approvedAt: new Date().toISOString(),
            });
            setApproved(true);
            Alert.alert("Success", "Request has been approved");
        } catch (error) {
            console.error("Error approving request:", error);
            Alert.alert("Error", "Failed to approve request");
        }
    };

    const handleReject = async () => {
        try {
            const docRef = doc(requestsRef, requestId);
            await updateDoc(docRef, {
                status: "rejected",
                rejectedAt: new Date().toISOString(),
            });
            Alert.alert("Notice", "Request has been rejected", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("Error rejecting request:", error);
            Alert.alert("Error", "Failed to reject request");
        }
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <View className="flex-1 justify-evenly">
            <View className="flex-1 pt-2 min-h-[300px] bg-gray-50">
                <RequestDetails request={request} />
            </View>

            {/* Show buttons only after request details are loaded */}
            {request && (
                <>
                    {approved ? (
                        <View className="flex-1 mt-5 p-3 bg-white rounded-lg shadow">
                            <TouchableOpacity
                                className="bg-green-500 py-4 rounded-lg items-center"
                                onPress={() => setModalVisible(true)}
                            >
                                <Text className="text-white font-semibold text-base">View Approved Equipment</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="mt-6 p-4 bg-white rounded-lg shadow">
                            <Text className="text-lg font-semibold text-center mb-5 text-gray-800">
                                Do you want to approve this request?
                            </Text>
                            <View className="flex-row justify-around mt-3">
                                <TouchableOpacity
                                    className="bg-green-500 py-3 px-8 rounded-lg min-w-24 items-center"
                                    onPress={handleApprove}
                                >
                                    <Text className="text-white font-semibold">Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-red-500 py-3 px-8 rounded-lg min-w-24 items-center"
                                    onPress={handleReject}
                                >
                                    <Text className="text-white font-semibold">No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </>
            )}

            {/* Modal for Approved Equipment */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end">
                    <View className="bg-white p-6 rounded-t-lg shadow-lg w-full">
                        <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            Approved Equipment
                        </Text>
                        {request.equipment?.map((item) => (
                            <View key={item.equipmentId} className="mb-2 border-b pb-2">
                                <Text className="text-gray-800 font-semibold">{item.name}</Text>
                                {
                                    item.img?
                                    <Image source={{ uri: item.img }} style={{ width: 100, height: 100 }} />
                                    :null
                                }
                                <Text className="text-gray-600">Quantity: {item.quantity}</Text>
                                <Text className="text-gray-600">Type: {item.type}</Text>
                            </View>
                        ))}
                        <TouchableOpacity
                            className="bg-red-500 py-3 rounded-lg mt-4 items-center"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
