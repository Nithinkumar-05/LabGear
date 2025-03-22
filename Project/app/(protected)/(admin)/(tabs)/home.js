import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/routes/AuthContext';
import HomeLoader from '@/components/HomeLoader';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const Home = () => {
    const { user, loading, logout } = useAuth();

    const router = useRouter();
    if (loading) {
        return (
            <View className="flex-1 mb-10 bottom-10 bg-slate-100">
                <HomeLoader />
            </View>
        );
    }

    return (
        <View className="flex-1 p-5 bg-white">
            <View>
                <Text className="text-xl font-extrabold">
                    Welcome, {user ? user.username : 'Guest'}
                </Text>
                <View className="mt-8 gap-4">
                    <View className="mb-4 flex-row items-center">
                        <MaterialIcons name="flash-on" size={24} color="#3b82f6" />
                        <Text className="text-xl font-bold text-gray-800 ml-2">Quick Access</Text>
                    </View>
                    <View className="flex-row flex-wrap justify-between">
                        <TouchableOpacity
                            className="w-[48%] h-32 bg-blue-50 rounded-xl p-4 justify-center items-center border border-blue-100"
                            activeOpacity={0.7}
                            onPress={() => router.push("/(admin)/requests")}
                        >
                            <MaterialIcons name="assignment" size={32} color="#3b82f6" />
                            <Text className="mt-2 text-lg font-bold text-blue-500">Requests</Text>
                        </TouchableOpacity>

                        {/* Analytics Button */}
                        <TouchableOpacity
                            className="w-[48%] h-32 bg-blue-50 rounded-xl p-4 justify-center items-center border border-blue-100"
                            activeOpacity={0.7}
                             onPress = {()=>{router.push("/(admin)/analytics")}}
                        >
                            <MaterialIcons name="analytics" size={32} color="#3b82f6" />
                            <Text className="mt-2 text-lg font-bold text-blue-500">Analytics</Text>
                        </TouchableOpacity>

                        {/* Labs Button */}
                        <TouchableOpacity
                            className="w-[48%] h-32 bg-blue-50 rounded-xl p-4 justify-center items-center border border-blue-100 mt-4"
                            activeOpacity={0.7}

                            onPress={() => {
                                console.log("Hello")
                                router.push("/(admin)/labs")
                            }}
                        >
                            <MaterialIcons name="computer" size={32} color="#3b82f6" />
                            <Text className="mt-2 text-lg font-bold text-blue-500">Labs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-[48%] h-32 bg-blue-50 rounded-xl p-4 justify-center items-center border border-blue-100 mt-4"
                            activeOpacity={0.7} onPress = {()=>{router.push("/(admin)/more")}}
                        >
                            <MaterialIcons name="more-horiz" size={32} color="#3b82f6" />
                            <Text className="mt-2 text-lg font-bold text-blue-500">More</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Home;