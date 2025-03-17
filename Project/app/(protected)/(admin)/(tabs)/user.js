import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import Search from '@/components/SearchBar';
import { db } from '@/firebaseConfig';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '@/components/AvatarGenerator';

const UserCard = ({ user, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
        activeOpacity={0.7}
    >
        <View className="p-4">
            <View className="flex-row items-center space-x-4 gap-2">
                {user.personal.profileImgUrl ? (
                    <Image
                        source={{ uri: user.personal.profileImgUrl }}
                        className="w-16 h-16 rounded-full"
                        contentFit="cover"
                    />
                ) : (
                    <Avatar name={user.personal?.name} size={64} />
                )}
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                        {user.personal?.name}
                    </Text>
                    {user.labInfo && (
                        <View className="mt-1">
                            <Text className="text-sm text-gray-500">
                                {user.labInfo.labName}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <MaterialCommunityIcons name="office-building-marker" size={14} color="#6b7280" />
                                <Text className="text-xs text-gray-500 ml-1">
                                    {user.labInfo.department}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
                <View className="bg-blue-50 p-2 rounded-full">
                    <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchLabDetails = async (user) => {
        if (user?.labDetails) {
            try {
                const labSnap = await getDoc(user.labDetails.labRef);

                if (labSnap.exists()) {
                    return { id: labSnap.id, ...labSnap.data() };
                }
            } catch (error) {
                console.error("Error fetching lab details:", error);
            }
        }
        return null;
    };

    const getUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'user'));
            const querySnapshot = await getDocs(q);

            const userList = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const userData = { id: doc.id, ...doc.data() };
                    userData.labInfo = await fetchLabDetails(userData);
                    return userData;
                })
            );
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        getUsers();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getUsers().finally(() => setRefreshing(false));
    }, []);

    const filteredUsers = users.filter(user =>
        user.personal?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const navigateToUserDetails = (user) => {
        router.push({
            pathname: "/(admin)/userDetails",
            params: { userId: user.id }
        });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Fixed Header */}
            <View className="bg-gray-100 px-6 pt-6 pb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">
                            Lab Programmers
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            {filteredUsers.length} active members
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/add-user')}
                        className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center shadow-lg active:bg-blue-600"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <Search
                    placeholder="Search programmers..."
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    height={hp(5.5)}
                    width={wp(88)}
                />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onPress={() => navigateToUserDetails(user)}
                        />
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center py-20">
                        <View className="bg-gray-100 rounded-full p-4 mb-4">
                            <Ionicons name="search" size={32} color="#9ca3af" />
                        </View>
                        <Text className="text-gray-600 text-lg font-medium">
                            No results found
                        </Text>
                        <Text className="text-gray-400 text-center mt-2 px-6">
                            We couldn't find any programmers matching your search criteria
                        </Text>
                    </View>
                )}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default Users;