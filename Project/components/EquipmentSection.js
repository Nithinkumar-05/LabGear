import { View, Text, TouchableOpacity, Image } from 'react-native';

const EquipmentSection = ({ title, items, addToCart }) => (
    <View className="mb-6">
        <Text className="text-lg font-bold mb-3">{title}</Text>
        <View className="space-y-4">
            {items.map((item) => (
                <View key={item.id} className="bg-white p-4 rounded-lg shadow mt-2">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center flex-1">
                            {/* ✅ Use 'style' for Image, remove 'className' */}
                            <Image
                                source={{
                                    uri: item.imageUrl?.startsWith('http') ? item.imageUrl : 'https://via.placeholder.com/150',
                                }}
                                style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: "#ddd" }}
                            />
                            <View style={{ marginLeft: 16, flex: 1 }}>
                                <Text className="text-lg font-semibold">{item.name}</Text>
                                <Text className="text-sm text-gray-500">Available: {item.quantity}</Text>
                                {item.quantity <= item.lowStockAlert && (
                                    <Text className="text-xs text-red-500">Low Stock Alert!</Text>
                                )}
                            </View>
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
            ))}
        </View>
    </View>
);

export default EquipmentSection;
