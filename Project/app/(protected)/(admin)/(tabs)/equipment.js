import { View, Text, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useState } from 'react';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from 'expo-router';

const Equipment = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView
                className="flex-1 bg-gray-50"
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 10}
            >
                <View className="flex-1 px-4 py-6">
                    <Text className="text-3xl font-bold text-gray-800 mb-6">
                        Equipment
                    </Text>
                    
                    {/* Search Bar & Add Button Container */}
                    <View className="flex-row items-center gap-3 ">
                        <View className="flex-1 shadow-lg">
                            <Searchbar
                                placeholder="Search equipment..."
                                rippleColor={'#3b82f6'}
                                onChangeText={setSearchQuery}
                                value={searchQuery}
                                style={{ backgroundColor: 'white',shadowColor:'#000' }}
                                inputStyle={{ color: '#1f2937' }}
                                iconColor="#3b82f6"
                                className="rounded-xl"
                            />
                        </View>
                        
                        <TouchableOpacity
                            className="bg-blue-500 w-12 h-12 rounded-full shadow-lg items-center justify-center active:bg-blue-600"
                            onPress={() => router.push('/(admin)/add-equipment')}
                        >
                            <Text className="text-white text-2xl font-semibold">+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Placeholder for equipment list */}
                    <View className="mt-6">
                        <Text className="text-gray-500 text-center py-8">
                            Your equipment list will appear here
                        </Text>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
}

export default Equipment;