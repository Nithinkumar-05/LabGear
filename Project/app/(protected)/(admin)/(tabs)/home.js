import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/routes/AuthContext';
import HomeLoader from '@/components/HomeLoader'; // Import the loader component

const Home = () => {
    const { user, loading, logout } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <View className="flex-1 mb-10 bottom-10 bg-slate-100">
                <HomeLoader />
            </View>
        );
    }

    // Show content when not loading
    return (
        <View className="flex-1 p-5 bg-white">
            <View>
                <Text className="text-xl font-bold">
                    Welcome, {user ? user.username : 'Guest'}
                </Text>
            </View>
            
        </View>
    );
};

export default Home;