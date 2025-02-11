import { View, Text, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image, Alert } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useState, useEffect, useMemo } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from 'expo-router';
import { componentsRef } from '@/firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import Search from '../../../../components/SearchBar';

const Equipment = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [equipment, setEquipment] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const q = query(componentsRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const equipmentData = [];
            snapshot.forEach((doc) => {
                equipmentData.push({ id: doc.id, ...doc.data() });
            });
            setEquipment(equipmentData);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (itemId, itemName) => {
        Alert.alert(
            "Delete Equipment",
            `Are you sure you want to delete ${itemName}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => setSelectedItem(null)
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(componentsRef, itemId));
                            setSelectedItem(null);
                            Alert.alert("Success", "Equipment deleted successfully");
                        } catch (error) {
                            console.error("Error deleting equipment:", error);
                            Alert.alert("Error", "Failed to delete equipment");
                        }
                    }
                }
            ]
        );
    };

    const searchEquipment = (items, searchTerm) => {
        if (!searchTerm) return items;

        const searchTermLower = searchTerm.toLowerCase().trim();

        return items.filter(item => {
            const searchableFields = [
                item.name,
                item.type,
                item.quantity.toString(),
                item.lowStockAlert.toString()
            ];

            return searchableFields.some(field =>
                field.toLowerCase().includes(searchTermLower)
            );
        });
    };

    const filteredEquipment = useMemo(() => {
        const searchResults = searchEquipment(equipment, searchQuery);
        return {
            consumables: searchResults.filter(item => item.type === 'consumable'),
            nonConsumables: searchResults.filter(item => item.type === 'non-consumable')
        };
    }, [equipment, searchQuery]);

    const EquipmentCard = ({ item }) => (
        <TouchableOpacity
            onPress={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
            className="bg-white rounded-xl p-4 mb-4 shadow-md"
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between">
                <View className="flex-row flex-1">
                    <Image
                        source={{ uri: item.imageUrl }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="cover"
                    />
                    <View className="ml-4 flex-1">
                        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                        <View className="flex-row mt-2">
                            <Text className="text-gray-600">Quantity: </Text>
                            <Text className={`font-medium ${item.quantity <= item.lowStockAlert ? 'text-red-500' : 'text-green-500'
                                }`}>
                                {item.quantity}
                            </Text>
                        </View>
                        {item.quantity <= item.lowStockAlert && (
                            <Text className="text-red-500 text-sm mt-1">
                                Low stock alert: {item.lowStockAlert}
                            </Text>
                        )}
                    </View>
                </View>


                <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    className="justify-center px-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="delete" size={24} color="#EF4444" />
                </TouchableOpacity>

            </View>
        </TouchableOpacity>
    );

    const EquipmentSection = ({ title, items }) => (
        items.length > 0 && (
            <View className="mt-6">
                <Text className="text-xl font-semibold text-gray-700 mb-4">{title}</Text>
                {items.map((item) => (
                    <EquipmentCard key={item.id} item={item} />
                ))}
            </View>
        )
    );

    const NoResults = () => (
        <View className="mt-6 items-center">
            <Text className="text-gray-500 text-lg">
                No equipment found matching "{searchQuery}"
            </Text>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setSelectedItem(null);
        }}>
            <KeyboardAwareScrollView
                className="flex-1 bg-gray-100"
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 10}
            >
                <View className="flex-1 px-4 py-6">
                    <Text className="text-3xl font-bold text-gray-800">
                        Equipment
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                        Manage and monitor lab equipments
                    </Text>
                    <View className="mt-4 flex-row items-center">
                        <Search
                            placeholder={"Search equipment..."}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            height={hp(6)}
                            width={wp(80)}
                        />
                        <TouchableOpacity
                            className="bg-blue-500 w-12 h-12 rounded-full shadow-lg items-center justify-center right-12 bottom-2 active:bg-blue-600"
                            onPress={() => router.push('/(admin)/add-equipment')}
                        >
                            <Text className="text-white text-2xl font-semibold">+</Text>
                        </TouchableOpacity>
                    </View>

                    {(filteredEquipment.nonConsumables.length === 0 &&
                        filteredEquipment.consumables.length === 0 &&
                        searchQuery) ? (
                        <NoResults />
                    ) : (
                        <>
                            <EquipmentSection
                                title="Non-Consumable Equipment"
                                items={filteredEquipment.nonConsumables}
                            />
                            <EquipmentSection
                                title="Consumable Equipment"
                                items={filteredEquipment.consumables}
                            />
                        </>
                    )}
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
}

export default Equipment;