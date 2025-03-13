import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { requestsRef } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const StatusBadge = ({ status }) => {
    const config = {
        pending: {
            icon: 'clock',
            color: '#FFA500',
            bgColor: 'rgba(255, 165, 0, 0.1)',
            text: 'Awaiting Approval'
        },
        approved: {
            icon: 'check-circle',
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
            text: 'Approved'
        },
        rejected: {
            icon: 'x-circle',
            color: '#EF4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            text: 'Rejected'
        }
    }[status];

    return (
        <View style={{ backgroundColor: config.bgColor }}
            className="flex-row items-center px-4 py-2 rounded-full">
            <Feather name={config.icon} size={16} color={config.color} />
            <Text style={{ color: config.color }}
                className="ml-2 font-semibold">
                {config.text}
            </Text>
        </View>
    );
};

const ItemCard = ({ item }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <View className="flex-row items-center">
            {item.img ? (
                <Image
                    source={{ uri: item.img }}
                    className="w-16 h-16 rounded-xl mr-4"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-16 h-16 rounded-xl bg-blue-50 items-center justify-center mr-4">
                    <MaterialCommunityIcons name="package-variant" size={28} color="#3B82F6" />
                </View>
            )}
            <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
                <View className="flex-row items-center mt-1">
                    <Text className="text-gray-500 text-sm capitalize">{item.type}</Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2" />
                    <View className="bg-blue-50 px-2 py-0.5 rounded">
                        <Text className="text-blue-700 font-medium">Qty: {item.quantity}</Text>
                    </View>
                </View>
            </View>
        </View>
    </View>
);

const TimelineEvent = ({ icon, title, date, isLast }) => (
    <View className="flex-row">
        <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                <Feather name={icon} size={16} color="#3B82F6" />
            </View>
            {!isLast && <View className="w-0.5 h-16 bg-gray-100 mt-2" />}
        </View>
        <View className="ml-4 flex-1">
            <Text className="text-gray-900 font-medium">{title}</Text>
            <Text className="text-gray-500 text-sm mt-1">{date}</Text>
        </View>
    </View>
);

export default function RequestSummary() {
    const { requestId } = useLocalSearchParams();
    const router = useRouter();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId) return;
            try {
                const docRef = doc(requestsRef, requestId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRequest({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [requestId]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                        <Feather name="loader" size={24} color="#3B82F6" className="animate-spin" />
                    </View>
                    <Text className="text-gray-900 font-semibold">Loading Request</Text>
                    <Text className="text-gray-500 mt-1">Please wait...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!request) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-6">
                <View className="items-center">
                    <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
                        <Feather name="alert-circle" size={32} color="#EF4444" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">Not Found</Text>
                    <Text className="text-gray-500 text-center mt-2 mb-6">
                        This request doesn't exist or has been removed
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-gray-900 px-8 py-3 rounded-xl flex-row items-center"
                    >
                        <Feather name="arrow-left" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Floating Header */}
            <BlurView intensity={80} tint="light" className="border-b border-gray-100">
                <View className="px-6 py-4">

                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 mr-4">
                            <Text className="text-2xl font-bold text-gray-900">{request.title}</Text>
                            <View className="flex-row items-center mt-2">
                                <MaterialCommunityIcons name="account" size={16} color="#6B7280" />
                                <Text className="text-gray-600 ml-1">{request.username}</Text>
                            </View>
                        </View>
                        <StatusBadge status={request.status} />
                    </View>
                </View>
            </BlurView>

            <ScrollView className="flex-1">
                {/* Lab Section */}
                <View className="p-6 border-b border-gray-100 bg-white">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Lab Information</Text>
                    <View className="space-y-2">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="domain" size={20} color="#6B7280" />
                            <Text className="text-gray-700 ml-2">{request.lab.labName}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="office-building" size={20} color="#6B7280" />
                            <Text className="text-gray-700 ml-2">{request.lab.department}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
                            <Text className="text-gray-700 ml-2">{request.lab.location}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Section */}
                <View className="p-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold text-gray-900">Requested Items</Text>
                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 font-medium">{request.equipment.length} items</Text>
                        </View>
                    </View>
                    {request.equipment.map((item, index) => (
                        <ItemCard key={index} item={item} />
                    ))}
                </View>

                {/* Timeline Section */}
                <View className="p-6 bg-white rounded-t-3xl">
                    <Text className="text-lg font-semibold text-gray-900 mb-6">Request Timeline</Text>
                    <View className="pl-4">
                        <TimelineEvent
                            icon="file-plus"
                            title="Request Created"
                            date={request.createdAt?.toDate().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        />
                        {request.approvedAt && (
                            <TimelineEvent
                                icon="check-circle"
                                title="Request Approved"
                                date={new Date(request.approvedAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                isLast
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
