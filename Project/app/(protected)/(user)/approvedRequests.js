import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { getDocs } from 'firebase/firestore';
import { approvedRequestsRef } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ApprovedRequest = () => {
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
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

    const filteredRequests = approvedRequests.filter(request =>
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Search Bar */}
            <View className="px-4 pt-4">
                <View className="flex-row items-center bg-white rounded-xl px-4 h-12 shadow">
                    <Feather name="search" size={20} className="text-gray-400 mr-2" />
                    <TextInput
                        placeholder="Search by Request ID..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 text-gray-900"
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchQuery && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Feather name="x" size={20} className="text-gray-400" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            <FlatList
                data={filteredRequests}
                keyExtractor={item => item.id || item.requestId}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleRequestPress(item)}
                        className="bg-white mx-4 my-2 p-4 rounded-lg shadow-md border border-gray-200"
                    >
                        <View className="flex-row justify-between mb-1">
                            <Text className="font-semibold text-lg">Request #{item.requestId.substring(0, 6)}</Text>
                            <Text className="text-gray-500">{formatDate(item.approvedAt)}</Text>
                        </View>

                        <Text className="text-gray-600 mb-2">
                            {item.equipment?.length || 0} item(s) requested
                        </Text>

                        <View className="flex-row justify-between items-center">
                            <Text className={item.status === "completed" ? "text-green-500 font-bold" : "text-blue-500 font-bold"}>
                                {item.status === "completed" ? "Completed" : "Add Invoice"}
                            </Text>

                            {item.totalAmountSpent && (
                                <Text className="font-bold text-lg">
                                    ₹{parseFloat(item.totalAmountSpent).toFixed(2)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-gray-400">No approved requests</Text>
                    </View>
                }
            />
        </View>
    );
};

export default ApprovedRequest;