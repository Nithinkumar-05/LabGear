import { View,Text,TouchableOpacity,Image } from 'react-native';
const EquipmentSection = ({ title, items, addToCart }) => (
    <View className="mb-6">
        <Text className="text-lg font-bold mb-3">{title}</Text>
        <View className="space-y-4">
            {items.map((item) => (
                <View key={item.id} className="bg-white p-4 rounded-lg shadow mt-2">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center flex-1">
                            <Image 
                                source={{ uri: item.imageUrl }}
                                className="w-16 h-16 rounded-lg"
                            />
                            <View className="ml-4 flex-1">
                                <Text className="text-lg font-semibold">{item.name}</Text>
                                <Text className="text-sm text-gray-500">Available: {item.quantity}</Text>
                                {item.quantity <= item.lowStockAlert && (
                                    <Text className="text-xs text-red-500">Low Stock Alert!</Text>
                                )}
                            </View>
                            <TouchableOpacity 
                                className="bg-blue-500 px-4 py-2 rounded-lg"
                                onPress={() => addToCart(item)}
                                disabled={item.quantity === 0}
                            >
                                <Text className="text-white">
                                    {item.quantity === 0 ? 'Out of Stock' : 'Add'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    </View>
);
export default EquipmentSection;