import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';

const DetailRow = ({ icon, label, value }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
        <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                <MaterialCommunityIcons name={icon} size={20} color="#3B82F6" />
            </View>
            <Text className="ml-3 text-gray-600 text-base">{label}</Text>
        </View>
        <Text className="text-gray-900 font-semibold text-base">{value}</Text>
    </View>
);

const ProgrammerCard = ({ programmer }) => (
    <View className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-3 border border-gray-100/20">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                <View className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 items-center justify-center">
                    <MaterialCommunityIcons name="account" size={28} color="#3B82F6" />
                </View>
                <View className="ml-4 flex-1">
                    <Text className="text-gray-900 font-bold text-lg">{programmer.name}</Text>
                    <Text className="text-gray-500 text-sm mt-0.5 opacity-75">{programmer.email}</Text>
                </View>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-gray-50/80 items-center justify-center">
                <Feather name="more-vertical" size={20} color="#6B7280" />
            </TouchableOpacity>
        </View>
    </View>
);

export default function LabDetails() {
    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const { labId } = useLocalSearchParams();
    const router = useRouter();

    useEffect(() => {
        const fetchLabDetails = async () => {
            try {
                const docRef = doc(db, "labs", labId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setLab({ id: docSnap.id, ...docSnap.data() });
                } else {
                    Alert.alert("Error", "Lab not found");
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching lab details:", error);
                Alert.alert("Error", "Failed to load lab details");
            } finally {
                setLoading(false);
            }
        };

        fetchLabDetails();
    }, [labId]);

    const handleDeleteLab = async () => {
        try {
            setLoading(true);
            await deleteDoc(doc(db, "labs", labId));
            Alert.alert(
                "Success",
                "Lab deleted successfully",
                [
                    {
                        text: "OK",
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            console.error("Error deleting lab:", error);
            Alert.alert("Error", "Failed to delete lab");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 mt-4">Loading lab details...</Text>
            </SafeAreaView>
        );
    }

    if (!lab) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="light" />

            {/* Profile Section */}
            <View className="px-2 mb-4">
                <View className="bg-white rounded-2xl shadow-sm p-4">
                    <View className="items-center">
                        <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center border-4 border-white -mt-16 mb-2">
                            <MaterialCommunityIcons name="desktop-tower-monitor" size={40} color="#3B82F6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{lab.labName}</Text>
                        <Text className="text-gray-600 mt-1">{lab.department}</Text>

                        <View className="flex-row mt-4 space-x-3">
                            <View className="items-center px-4">
                                <Text className="text-2xl font-bold text-gray-900">{lab.systems || 0}</Text>
                                <Text className="text-gray-500 text-sm">Systems</Text>
                            </View>
                            <View className="h-10 w-px bg-gray-200" />
                            <View className="items-center px-4">
                                <Text className="text-2xl font-bold text-gray-900">{lab.programmers?.length || 0}</Text>
                                <Text className="text-gray-500 text-sm">Programmers</Text>
                            </View>
                            <View className="h-10 w-px bg-gray-200" />
                            <View className="items-center px-4">
                                <MaterialCommunityIcons name="map-marker" size={24} color="#3B82F6" />
                                <Text className="text-gray-500 text-sm">{lab.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* About Section */}
                {lab.description && (
                    <View className="bg-white p-4 mb-3">
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
                            <Text className="text-lg font-semibold text-gray-900 ml-2">About</Text>
                        </View>
                        <Text className="text-gray-600 leading-relaxed">{lab.description}</Text>
                    </View>
                )}

                {/* Programmers Section */}
                <View className="bg-white p-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="account-group" size={24} color="#3B82F6" />
                            <Text className="text-lg font-semibold text-gray-900 ml-2">
                                Programmers · {lab.programmers?.length || 0}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: "/(admin)/manageProgrammers",
                                params: { labId: lab.id }
                            })}
                            className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full"
                        >
                            <Feather name="plus" size={18} color="#3B82F6" />
                            <Text className="text-blue-600 font-medium ml-1">Add</Text>
                        </TouchableOpacity>
                    </View>

                    {lab.programmers && lab.programmers.length > 0 ? (
                        <View className="space-y-3">
                            {lab.programmers.map((programmer, index) => (
                                <View key={index} className="flex-row items-center justify-between py-2">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                                            <MaterialCommunityIcons name="account" size={24} color="#6B7280" />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-gray-900 font-semibold">{programmer.name}</Text>
                                            <Text className="text-gray-500 text-sm">{programmer.email}</Text>
                                        </View>
                                        <TouchableOpacity className="p-2">
                                            <MaterialCommunityIcons name="dots-horizontal" size={20} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="py-8 items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                                <MaterialCommunityIcons name="account-group" size={32} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-900 font-medium">No Programmers Yet</Text>
                            <Text className="text-gray-500 text-center text-sm mt-1">
                                Start by adding programmers to this lab
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="p-4 bg-white border-t border-gray-100">
                <View className="flex-row space-x-2">
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: "/(admin)/editLab",
                            params: { labId: lab.id }
                        })}
                        className="flex-1 bg-blue-50 py-3 rounded-xl items-center"
                    >
                        <Text className="text-blue-600 font-semibold">Edit Lab</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Delete Lab",
                                "Are you sure you want to delete this lab?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: handleDeleteLab
                                    }
                                ]
                            );
                        }}
                        className="flex-1 bg-red-50 py-3 rounded-xl items-center"
                    >
                        <Text className="text-red-600 font-semibold">Delete Lab</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}



