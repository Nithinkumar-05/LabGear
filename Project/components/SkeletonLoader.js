import React from "react";
import { View } from "react-native";

const SkeletonLoader = () => {
    return (
        <View className="p-4 space-y-4">
            {/* Request Title */}
            <View className="h-6 bg-gray-300 rounded w-1/2" />

            {/* Status Badge */}
            <View className="h-4 bg-gray-300 rounded w-1/4" />

            {/* Equipment List */}
            <View className="space-y-2">
                {[1, 2, 3].map((_, index) => (
                    <View key={index} className="h-5 bg-gray-300 rounded w-3/4" />
                ))}
            </View>

            {/* Requested Date */}
            <View className="h-4 bg-gray-300 rounded w-1/3" />
        </View>
    );
};

export default SkeletonLoader;
