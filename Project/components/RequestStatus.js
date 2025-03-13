
import React from "react";
import { View, Text } from "react-native"

export default function RequestStatus({ data }) {

    return
    (
        <View>
            <View className="relative pt-1">
                <View className="flex h-2 mb-4 overflow-hidden text-xs bg-gray-200 rounded">
                    {data.status === 'pending' && <View className="w-1/3 bg-blue-500"></View>}
                    {data.status === 'under review' && <View className="w-2/3 bg-blue-500"></View>}
                    {data.status === 'approved' && <View className="w-full bg-blue-500"></View>}
                </View>
            </View>
        </View>
    )
}