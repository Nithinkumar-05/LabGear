import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRefresh } from '@/routes/RefreshContext'; 

const EquipmentDetails = () => {
    const { data } = useRefresh();
    const renderItem = ({ item }) => (
        <TouchableOpacity className="bg-white rounded-lg p-4 mb-4 shadow-md">
            <View className="flex-row items-center">
                <MaterialCommunityIcons name="tools" size={28} color="#3B82F6" />
                <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold text-gray-900">{item.type}</Text>
                    <Text className="text-sm text-gray-600">{item.specifications}</Text>
                    <Text className="text-sm text-gray-500">Units: {item.units}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 p-4">
            <View>
                <Text>Lab Name : {data.lab.labName}</Text>
            </View>
            <FlatList
                data={data.lab.equipment || []} 
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-gray-400">No equipment available</Text>
                    </View>
                }
            />
        </View>
    );
};

export default EquipmentDetails;