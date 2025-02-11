import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import Search from '@/components/SearchBar';
import { db } from '@/firebaseConfig';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
const User = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLabDetails, setExpandedLabDetails] = useState({});

    useEffect(() => {
        const getUsers = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'user'));
                const querySnapshot = await getDocs(q);
                const userList = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const userData = { id: doc.id, ...doc.data() };
                        // Fetch lab details if reference exists

                        const labRef = userData.labName;
                        if (labRef) {
                            const labSnap = await getDoc(labRef);
                            if (labSnap.exists()) {
                                userData.labInfo = labSnap.data();
                            }
                        }

                        return userData;
                    })
                );
                setUsers(userList);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        getUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRequestPress = (request) => {

        router.push({
            pathname: "/(admin)/",
            params: { requestId: request.id }
        });

    };

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header Section */}
            <View className=" px-4 py-6 shadow-sm">
                <Text className="text-2xl font-bold text-gray-800">Lab Programmers</Text>
                <View className="mt-4">
                    <Search
                        placeholder="Search programmers..."
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        height={hp(6)}
                        width={wp(90)}
                    />
                </View>
            </View>

            {/* Users List */}
            <View className="px-4 py-4">
                {filteredUsers.length > 0 ? (
                    <View className="space-y-4">
                        {filteredUsers.map(user => (
                            <TouchableOpacity
                                key={user.id}
                                onPress={() => handleRequestPress(user.id)}
                                className="bg-white rounded-xl shadow-sm overflow-hidden mt-2"
                            >
                                <View className="p-4 flex-row items-center gap-3">
                                    <Image
                                        source={{
                                            uri: user.profileImageUrl ||
                                                'https://ui-avatars.com/api/?name=' +
                                                encodeURIComponent(user.username)
                                        }}
                                        className="w-16 h-16 rounded-full bg-gray-200"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">
                                            {user.username}
                                        </Text>
                                        {user.labInfo && (
                                            <Text className="text-sm text-gray-500 mt-1">
                                                {user.labInfo.name || 'Lab details not available'}
                                            </Text>
                                        )}
                                        <Text className="text-xs text-gray-400 mt-1">
                                            Last active: {new Date(user.lastLogin).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>

                                {/* Expanded Lab Details */}
                                {expandedLabDetails[user.id] && user.labInfo && (
                                    <View className="px-4 pb-4 bg-gray-50">
                                        <View className="pt-4 border-t border-gray-100">
                                            <Text className="text-sm font-medium text-gray-700">
                                                Lab Details
                                            </Text>
                                            {/* Add more lab details here as needed */}
                                            <Text className="text-sm text-gray-600 mt-1">
                                                {user.labInfo.description || 'No description available'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center py-12">
                        <Text className="text-gray-500 text-center">
                            No programmers found.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default User;