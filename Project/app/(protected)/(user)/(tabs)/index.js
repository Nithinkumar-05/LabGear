import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/routes/AuthContext';

const Home = () => {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100 p-5">
                <Text className="text-base">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-5">
            <Text className="text-3xl font-bold mb-2.5">Home of User</Text>
            <Text className="text-2xl mb-2">
                {`Welcome, ${user?.username || 'User'}!`}
            </Text>
            <Text className="text-xl text-gray-600 mb-5">
                {`Role: ${user?.role || 'N/A'}`}
            </Text>
            <TouchableOpacity
                className="bg-black px-6 py-3 rounded-xl"
                onPress={logout}
            >
                <Text className="text-white text-base font-semibold">Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Home;