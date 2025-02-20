import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import useRequestDetails from '@/utils/RequestDetails';
import { useRouter } from 'expo-router';
const Requests = () => {
    const { requests, loading, error } = useRequestDetails();
    const router = useRouter();
    if (loading) return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
    );
    
    if (error) return (
        <View className="flex-1 justify-center items-center bg-gray-50 p-4">
            <Text className="text-red-500 text-lg font-medium text-center">{error}</Text>
        </View>
    );
    
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'text-green-600';
            case 'pending': return 'text-amber-500';
            case 'rejected': return 'text-red-500';
            default: return 'text-gray-600';
        }
    };
    
    const getStatusBgColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100';
            case 'pending': return 'bg-amber-100';
            case 'rejected': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    };

    const handleRequestDetails = (item) => {
        // Navigate to request details screen
        router.push({
            pathname: "/(stockmanager)/requestsummary",
            params: { requestId: item.id }
        });
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className=" py-4 shadow-sm">
                <Text className="text-2xl font-bold text-center text-gray-800">Requests</Text>
            </View>
            
            {requests.length > 0 ? (
                <FlatList
                    className="px-4 pt-4 bg-white"
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="mb-4 rounded-xl overflow-hidden border  bg-white shadow-sm">
                            <View className="bg-indigo-50 p-4 border-b border-gray-200">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-lg font-semibold text-gray-800">
                                        Request #{item.id.slice(0, 6)}
                                    </Text>
                                    <View className={`px-3 py-1 rounded-full ${getStatusBgColor(item.status)}`}>
                                        <Text className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-gray-600 mt-1">Lab ID: {item.labId}</Text>
                                <Text className="text-gray-600">Requested by: {item.username.trim()}</Text>
                            </View>
                            
                            <View className="p-4">
                                <Text className="font-semibold text-gray-700 mb-2">Equipment</Text>
                                {item.equipment.map((eq, idx) => (
                                    <View
                                        key={`${eq.equipmentId}-${idx}`}
                                        className={`flex-row justify-between items-center py-3 ${
                                            idx < item.equipment.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                    >
                                        <View className="flex-1">
                                            {
                                                eq.img?<Image source={{uri: eq.img}} style={{width: 50, height: 50, borderRadius: 10}} />:null
                                            }
                                            <Text className="text-gray-800 font-medium">{eq.name.trim()}</Text>
                                            <Text className="text-gray-500 text-xs">{eq.type}</Text>
                                        </View>
                                        <View className="bg-gray-100 px-2 py-1 rounded-md">
                                            <Text className="text-gray-700">Qty: {eq.quantity}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            
                            <TouchableOpacity 
                                className="bg-gray-100 p-3 flex-row justify-center items-center"
                                onPress={()=>handleRequestDetails(item)}
                            >
                                <Text className="text-indigo-600 font-medium mr-2">View Details</Text>
                                <AntDesign name="arrowright" size={16} color="#4F46E5" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center p-4">
                    <AntDesign name="inbox" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 text-lg mt-4 text-center">No requests found</Text>
                </View>
            )}
        </View>
    );
};

export default Requests;