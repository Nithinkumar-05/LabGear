import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { getDocs } from 'firebase/firestore';
import { approvedRequestsRef } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

const ApprovedRequest = () => {
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchApprovedRequests = async () => {
            try {
                const approvedRequestsSnapshot = await getDocs(approvedRequestsRef);
                const approvedRequestsList = approvedRequestsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    requestId: doc.id
                }));
                setApprovedRequests(approvedRequestsList);
            } catch (error) {
                console.error("Error fetching approved requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedRequests();
    }, []);

    // Fixed function - removed the nested definition
    const handleRequestPress = (item) => {
        router.push({
            pathname: '/(user)/invoice',
            params: {
                requestId: item.id
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">


            {approvedRequests.length > 0 ? (
                <FlatList
                    data={approvedRequests}
                    keyExtractor={item => item.id || item.requestId}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleRequestPress(item)}
                            className="px-4 py-4 border-b border-gray-200"
                        >
                            <View className="flex-row justify-between mb-1">
                                <Text className="font-semibold">Request #{item.requestId.substring(0, 6)}</Text>
                                <Text className="text-gray-500">{formatDate(item.approvedAt)}</Text>
                            </View>

                            <Text className="text-gray-600 mb-2">
                                {item.equipment?.length || 0} item(s) requested
                            </Text>

                            <View className="flex-row justify-between items-center">
                                <Text className={item.status === "completed" ? "text-green-500" : "text-blue-500"}>
                                    {item.status === "completed" ? "Completed" : "Add Invoice"}
                                </Text>

                                {item.totalAmountSpent && (
                                    <Text className="font-bold">
                                        ₹{parseFloat(item.totalAmountSpent).toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400">No approved requests</Text>
                </View>
            )}
        </View>
    );
};

export default ApprovedRequest;