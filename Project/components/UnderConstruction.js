import React, { useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const UnderConstruction = () => {

    return (
        <View className="flex-1 justify-center items-center bg-white p-6">
            <View className="bg-yellow-50 p-8 rounded-3xl border-yellow-200  items-center">
                {/* Animated gear icons */}
                <View className="flex-row mb-4">

                    <MaterialIcons name="settings" size={40} color="#EAB308" />
                    <View className="mx-2" />

                    <MaterialIcons name="build" size={40} color="#EAB308" />
                </View>

                {/* Main text */}
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Under Construction
                </Text>

                {/* Subtitle */}
                <Text className="text-gray-600 text-center text-base">
                    We're working hard to bring you something amazing!
                </Text>
            </View>
        </View >
    );
};

export default UnderConstruction;