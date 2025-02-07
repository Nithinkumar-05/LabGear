import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { addDoc } from "firebase/firestore";
import { componentsRef } from '@/firebaseConfig';
import { UPLOAD_PRESET, CLOUD_NAME } from "@env";
import { useRouter } from 'expo-router';
const uploadImageToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
    });
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
        let response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: data,
        });
        let result = await response.json();
        return result.secure_url;
    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
};

const AddEquipment = () => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [lowStockAlert, setLowStockAlert] = useState('');
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [equipmentType,setEquipmentType] = useState('');
    const router = useRouter();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images','livePhotos'],
            aspect: [5, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const saveEquipment = async () => {
        if (!name || !quantity || !lowStockAlert || !image || !equipmentType) {
            alert("Please fill all fields and upload an image!");
            return;
        }

        setUploading(true);
        let imageUrl = await uploadImageToCloudinary(image);
        setUploading(false);

        if (!imageUrl) {
            alert("Image upload failed!");
            return;
        }

        try {
            await addDoc(componentsRef, {
                name,
                quantity: Number(quantity),
                lowStockAlert: Number(lowStockAlert),
                imageUrl,
                type: equipmentType,
                createdAt: new Date(),
            });
            alert("Equipment added successfully!");
            router.back();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-6">
                <Text className="text-2xl font-bold text-gray-800 mb-6">Add Equipment</Text>

                <View className="items-center mb-6">
                    <TouchableOpacity 
                        onPress={pickImage}
                        className="w-48 h-48 bg-white rounded-xl shadow-black shadow-lg items-center justify-center border-2 border-dashed border-gray-300"
                    >
                        {image ? (
                            <Image 
                                source={{ uri: image }} 
                                className="w-full h-full rounded-xl"
                            />
                        ) : (
                            <View className="items-center">
                                <Text className="text-gray-500 mt-2 text-sm">Tap to upload image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-xl shadow-black shadow-lg p-4 mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-3">Equipment Type</Text>
                    <View className="flex-row justify-between gap-3">
                        <TouchableOpacity 
                            onPress={() => setEquipmentType('consumable')}
                            className={`flex-1 p-4 rounded-xl border-2 ${
                                equipmentType === 'consumable' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            }`}
                        >
                            <Text className={`text-center font-semibold ${
                                equipmentType === 'consumable' 
                                ? 'text-blue-500' 
                                : 'text-gray-600'
                            }`}>Consumable</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => setEquipmentType('non-consumable')}
                            className={`flex-1 p-4 rounded-xl border-2 ${
                                equipmentType === 'non-consumable' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            }`}
                        >
                            <Text className={`text-center font-semibold ${
                                equipmentType === 'non-consumable' 
                                ? 'text-blue-500' 
                                : 'text-gray-600'
                            }`}>Non-Consumable</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Equipment Name</Text>
                        <TextInput 
                            placeholder="Enter equipment name"
                            value={name}
                            onChangeText={setName}
                            className="bg-white border border-gray-200 p-4 rounded-xl shadow-black shadow-sm"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Quantity</Text>
                        <TextInput 
                            placeholder="Enter quantity"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            className="bg-white border border-gray-200 p-4 rounded-xl shadow-black shadow-sm"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Low Stock Alert</Text>
                        <TextInput 
                            placeholder="Set low stock alert threshold"
                            value={lowStockAlert}
                            onChangeText={setLowStockAlert}
                            keyboardType="numeric"
                            className="bg-white border border-gray-200 p-4 rounded-xl shadow-black shadow-sm"
                        />
                    </View>

                    <TouchableOpacity 
                        className={`p-4 rounded-xl shadow-black shadow-lg mt-4 ${uploading ? "bg-gray-400" : "bg-green-500"}`}
                        onPress={saveEquipment}
                        disabled={uploading}
                    >
                        <Text className="text-white text-center text-lg font-semibold">
                            {uploading ? "Uploading..." : "Save Equipment"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default AddEquipment;