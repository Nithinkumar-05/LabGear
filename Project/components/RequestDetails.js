import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { labsRef } from "@/firebaseConfig";
const RequestDetails = ({ request }) => {
    const [labDetails, setLabDetails] = useState(null);

    return (
        <View className="flex-1 bg-white min-h-full">


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
                        <View key={index} className="flex-1 flex-row justify-center items-center bg-gray-100 p-3 rounded-lg mb-2">
                            <Image 
                                source={{ uri: item.img }}
                                style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: "#ddd" }}
                            />
                            <View className="ml-4">
                                <Text className="font-medium">{item.name}</Text>
                                <View className="flex-row justify-between mt-1">
                                    <Text className="text-gray-600">Type: {item.type}</Text>
                                    <Text className="text-gray-600">Quantity: {item.quantity}</Text>
                                </View>
                            </View>
                            
                        </View>
                    ))}
                </View>

                {/* Lab Details */}
                <View className="bg-gray-100 p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-2">Lab Details</Text>
                    {request.labId===null ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                    ) : request.lab ? (
                        <View>
                            <Text className="text-gray-600">Lab Name: {request.lab.labName}</Text>
                            <Text className="text-gray-600">Department: {request.lab.department}</Text>
                            <Text className="text-gray-600">Location: {request.lab.location}</Text>
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
