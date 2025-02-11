import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import { doc, getDoc } from "firebase/firestore";

const RequestDetails = ({ request }) => {
    const [labDetails, setLabDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabDetails = async () => {
            if (request?.userId) {
                setLoading(true);
                try {
                    const labRef = request.labName;
                    if (labRef) {
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
        <View className="flex-1 bg-white">


            {/* Content */}
            <ScrollView className="flex-1 p-4">
                {/* Request Information */}
                <View className="bg-gray-100 p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold">
                        Request #{request?.id?.slice(0, 6)}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        Submitted by: {request?.username}
                    </Text>
                    <Text className="text-sm text-gray-600">
                        Date: {request?.createdAt ? request.createdAt.toDate().toLocaleString() : ""}
                    </Text>

                </View>

                {/* Equipment Requested */}
                <View className="mb-4">
                    <Text className="text-lg font-semibold mb-2">{`${request?.equipment.length} item(s) in this request`}</Text>
                    {request?.equipment.map((item, index) => (
                        <View key={index} className="bg-gray-100 p-3 rounded-lg mb-2">
                            {/* <Image src=""></Image> */}
                            <Text className="font-medium">{item.name}</Text>
                            <View className="flex-row justify-between mt-1">
                                <Text className="text-gray-600">Type: {item.type}</Text>
                                <Text className="text-gray-600">Quantity: {item.quantity}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Lab Details */}
                <View className="bg-gray-100 p-4 rounded-lg mb-4">
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
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-semibold">Status</Text>
                    <View className={`px-3 py-1 rounded-full ${request.status === 'approved' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                        <Text className={`text-sm font-medium ${request.status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                            }`}>
                            {request.status}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View >
    );
};

export default RequestDetails;
