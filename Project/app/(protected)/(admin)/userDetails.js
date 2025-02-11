import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import Avatar from '../../../components/AvatarGenerator';

const UserDetails = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { userId } = useLocalSearchParams();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUser({ id: userDoc.id, ...userDoc.data() });
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
            setLoading(false);
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    if (loading || !user) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#0284c7" />
            </View>
        );
    }

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) : 'N/A';
    };

    return (
        <ScrollView className="flex-1">
            {/* Profile Section */}
            <View className="bg-blue-600 px-6 pt-8 pb-6">
                <View className="items-center">
                    {/* Profile Image or Avatar */}
                    {user.personal?.profileImgUrl ? (
                        <Image
                            source={{ uri: user.personal.profileImgUrl }}
                            className="w-40 h-40 rounded-full bg-gray-200"
                        />
                    ) : (
                        <View className="w-40 h-40">
                            {/* Default Avatar */}
                            <Avatar name={user.personal?.name} size={120} fontSize={50} />
                        </View>
                    )}
                    <Text className="text-2xl font-bold text-white">
                        {user.personal?.name || 'N/A'}
                    </Text>
                    <Text className="text-white mt-1">
                        {user.personal?.email || 'N/A'}
                    </Text>
                </View>
            </View>

            {/* Content Sections */}
            <View className="px-6 py-6 space-y-6">
                {/* Account Details */}
                <View className="bg-white rounded-xl p-6 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="person" size={22} color="#3b82f6" />
                        <Text className="text-lg font-semibold text-gray-800 ml-2">
                            Account Details
                        </Text>
                    </View>
                    <View className="space-y-4">
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">User ID</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {user.uid || 'N/A'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">Joined</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {formatDate(user.createdAt)}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">Last Login</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {formatDate(user.lastLogin)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Professional Details */}
                <View className="bg-white rounded-xl p-6 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="briefcase" size={22} color="#3b82f6" />
                        <Text className="text-lg font-semibold text-gray-800 ml-2">
                            Professional Details
                        </Text>
                    </View>
                    <View className="space-y-4">
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">Department</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {user.professional?.department || 'N/A'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">Designation</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {user.professional?.designation || 'N/A'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">Employee ID</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {user.professional?.empId || 'N/A'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 w-24">Role</Text>
                            <Text className="text-gray-800 flex-1 font-medium">
                                {user.professional?.role || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default UserDetails;
