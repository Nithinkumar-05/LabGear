import { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Avatar, Button, Card, Chip } from "react-native-paper";
import { useRefresh } from "@/routes/RefreshContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const QuickActionButton = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-3xl p-5 flex-row items-center border border-gray-100 shadow-sm"
    >
        <View className="w-14 h-14 rounded-2xl bg-blue-500 items-center justify-center">
            <Feather name={icon} size={24} color="white" />
        </View>
        <View className="flex-1 ml-4">
            <Text className="text-gray-900 font-semibold text-lg">{title}</Text>
            {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
        </View>
        <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
            <Feather name="chevron-right" size={20} className="text-gray-400" />
        </View>
    </TouchableOpacity>
);

const StatCard = ({ label, value, icon, bgColor, textColor }) => (
    <View className={`${bgColor} rounded-2xl p-4 flex-1 mx-1.5`}>
        <View className="flex-row items-center justify-between mb-2">
            <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                <Feather name={icon} size={20} color="white" />
            </View>
            <Text className="text-white text-2xl font-bold">{value}</Text>
        </View>
        <Text className="text-white/90 text-sm font-medium">{label}</Text>
    </View>
);

const InventoryItem = ({ item, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
    >
        <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-gray-100 items-center justify-center">
                <Feather name="box" size={20} className="text-gray-600" />
            </View>
            <View className="ml-3">
                <Text className="text-gray-900 font-semibold">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.model}</Text>
            </View>
        </View>
        <View className="flex-row items-center">
            <View className="bg-red-50 px-3 py-1.5 rounded-full flex-row items-center">
                <Feather name="alert-circle" size={14} className="text-red-500 mr-1" />
                <Text className="text-red-500 font-medium">{item.stock}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const Home = () => {
    const { data, loading, refreshData } = useRefresh();
    const router = useRouter();

    useEffect(() => {
        refreshData();
    }, []);

    const pendingRequests = data.requests?.filter(req => req.status === "pending").length || 0;
    const approvedRequests = data.requests?.filter(req => req.status === "approved").length || 0;

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} />}
            contentContainerClassName="pb-8"
        >
            {/* Header Section */}
            <View className="bg-white px-6 pt-14 pb-6">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="relative">
                            <Avatar.Image
                                size={56}
                                source={{ uri: data.user?.personal.profileImgUrl || undefined }}
                                className="bg-blue-50"
                            />
                            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                        </View>
                        <View className="ml-4">
                            <Text className="text-2xl font-bold text-gray-900">
                                {data.user?.personal?.name || "Welcome Back"}
                            </Text>
                            <Text className="text-gray-500 font-medium">Lab Programmer</Text>
                        </View>
                    </View>

                </View>
            </View>

            {/* Stats Cards */}
            <View className="px-6 py-6">
                <View className="flex-row">
                    <StatCard
                        label="Pending Requests"
                        value={pendingRequests}
                        icon="clock"
                        bgColor="bg-amber-500"
                        textColor="text-amber-50"
                    />
                    <StatCard
                        label="Approved Requests"
                        value={approvedRequests}
                        icon="check-circle"
                        bgColor="bg-blue-500"
                        textColor="text-blue-50"
                    />
                    <TouchableOpacity
                        className="flex-row items-center border border-1 border-blue-500 rounded-2xl p-4 bg-blue-100"
                        onPress={() => router.push("(user)/request-history")}
                    >
                        <Text className=" font-medium mr-1 text-blue-500">View All</Text>
                        <Feather name="arrow-right" color={"#3b82f6"} size={16} className="text-blue-500" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="px-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-gray-900">Quick Actions</Text>
                </View>

                <View className="space-y-4 m-1">
                    <QuickActionButton
                        icon="plus"
                        title="New Request"
                        subtitle="Create equipment request"
                        onPress={() => router.push("(user)/requestform")}
                    />

                </View>
                <View className="space-y-4">
                    <QuickActionButton
                        icon="calendar"
                        title="Lab Schedule"
                        subtitle="Weekly schedule"
                        onPress={() => router.push("(user)/labschedule")}
                    />

                </View>
            </View>


        </ScrollView>
    );
};

export default Home;