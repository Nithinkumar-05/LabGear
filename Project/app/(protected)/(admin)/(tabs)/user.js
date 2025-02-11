import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import Search from '@/components/SearchBar';
import { db } from '@/firebaseConfig';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchLabDetails = async (user) => {
        if (user?.labdetails) {
            try {
                const labSnap = await getDoc(user.labdetails);

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
                <ActivityIndicator size="large" color="#0284c7" />
            </View>
        );
    }

    return (
        <ScrollView 
            className="flex-1 bg-gray-100"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View className="px-4 pt-6 pb-4 shadow-sm">
                <Text className="text-3xl font-bold text-gray-800">
                    Lab Programmers
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                    Manage and monitor lab programmer profiles
                </Text>
                <View className="mt-4 flex-row items-center">
                    <Search
                        placeholder="Search by name..."
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        height={hp(6)}
                        width={wp(80)}
                    />
                    <TouchableOpacity
                            className="bg-blue-500 w-12 h-12 rounded-full shadow-lg items-center justify-center right-12 bottom-2 active:bg-blue-600"
                            onPress={() => router.push('/(admin)/add-user')}
                        >
                            <Text className="text-white text-2xl font-semibold">+</Text>
                        </TouchableOpacity>
                </View>
            </View>

            {/* Users List */}
            <View className="px-4 py-4">
                {filteredUsers.length > 0 ? (
                    <View className="space-y-3">
                        {filteredUsers.map(user => (
                            <TouchableOpacity
                                key={user.id}
                                onPress={() => navigateToUserDetails(user)}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                activeOpacity={0.7}
                            >
                                <View className="p-4 flex-row items-center space-x-4 gap-3">
                                    <Image
                                        source={{
                                            uri: user.personal?.profileImgUrl ||
                                                'https://ui-avatars.com/api/?name=' +
                                                encodeURIComponent(user.personal?.name || '')
                                        }}
                                        className="w-14 h-14 rounded-full bg-gray-200"
                                    />
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-lg font-semibold text-gray-800">
                                                {user.personal?.name}
                                            </Text>
                                            
                                        </View>
                                        
                                        {user.labInfo && (
                                            <View className="flex-row items-center mt-2">
                                                <Ionicons name="flask-outline" size={14} color="#6b7280" />
                                                <Text className="text-xs text-gray-500 ml-1">
                                                    {user.labInfo.labname} • {user.labInfo.department}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center py-12">
                        <Ionicons name="search-outline" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 text-center mt-4">
                            No programmers found matching your search.
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default Users;