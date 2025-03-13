import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { View, ScrollView, TextInput, RefreshControl, TouchableOpacity } from "react-native";
import { Text, Button, Menu, ActivityIndicator, useTheme } from "react-native-paper";
import { useRefresh } from "@/routes/RefreshContext";
import { Feather } from "@expo/vector-icons";

import { Timestamp } from "firebase/firestore";

const extractDate = (timestamp) => {
    if (!timestamp) return null;

    const dateObj = timestamp.toDate();
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        approved: {
            bg: "bg-green-50",
            text: "text-green-700",
            borderColor: "border-green-200",
            icon: "check-circle",
            iconBg: "bg-green-100",
        },
        pending: {
            bg: "bg-yellow-50",
            text: "text-yellow-700",
            borderColor: "border-yellow-200",
            icon: "clock",
            iconBg: "bg-yellow-100",
        },
    };

    const config = statusConfig[status] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        borderColor: "border-gray-200",
        icon: "help-circle",
        iconBg: "bg-gray-100",
    };

    return (
        <View className={`flex-row items-center px-3 py-1.5 rounded-full ${config.bg} border ${config.borderColor}`}>
            <View className={`w-5 h-5 rounded-full ${config.iconBg} items-center justify-center mr-1.5`}>
                <Feather name={config.icon} size={12} className={config.text} />
            </View>
            <Text className={`text-xs font-semibold ${config.text} pr-1`}>
                {status}
            </Text>
        </View>
    );
};

const RequestHistory = () => {
    const router = useRouter();
    const { data, loading, refreshData } = useRefresh();
    const [filter, setFilter] = useState("All");
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const filterOptions = [
        { label: "All", icon: "list" },
        { label: "Pending", icon: "clock" },
        { label: "Approved", icon: "check-circle" },

    ];

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
    }, [refreshData]);

    const filteredRequests = data?.requests?.filter(req =>
        (filter === "All" || req.status === filter) &&
        req.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const RequestCard = ({ request }) => (

        < TouchableOpacity
            onPress={() => { router.push({ pathname: "/(user)/requestsummary", params: { requestId: request.id } }) }}
            className="bg-white flex-row items-center justify-between p-5 rounded-xl mb-3 shadow-sm border border-gray-100 h-35"
        >
            <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">#{request.id}</Text>
                <View className="flex-row items-center">
                    <Feather name="calendar" size={14} className="text-gray-400 mr-1.5" />
                    <Text className="text-sm text-gray-500">
                        {extractDate(request.createdAt)}
                    </Text>
                </View>
            </View>
            <StatusBadge status={request.status} />
        </TouchableOpacity >
    );
    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className=" px-4 pt-1 pb-6 rounded-b-3xl">

                {/* Search Bar */}
                <View className="mt-4 flex-row items-center space-x-2">
                    <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12">
                        <Feather name="search" size={20} className="text-gray-400 mr-2" />
                        <TextInput
                            placeholder="Search by Request ID..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="flex-1 text-gray-900"
                            placeholderTextColor="#9CA3AF"
                        />
                        {searchQuery && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Feather name="x" size={20} className="text-gray-400" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                    >
                        {filterOptions.map(option => (
                            <Menu.Item
                                key={option.label}
                                onPress={() => {
                                    setFilter(option.label);
                                    setMenuVisible(false);
                                }}
                                title={option.label}
                                leadingIcon={option.icon}
                            />
                        ))}
                    </Menu>
                </View>
            </View>

            {/* Filter Chips */}
            <View className="border-b border-gray-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4 py-3"
                >
                    {filterOptions.map(option => (
                        <TouchableOpacity
                            key={option.label}
                            onPress={() => setFilter(option.label)}
                            className={`mr-2 h-8 px-3 rounded-full flex-row items-center justify-center ${filter === option.label
                                ? "bg-blue-100 border border-blue-200"
                                : "bg-gray-50 border border-gray-100"
                                }`}
                        >
                            <Feather
                                name={option.icon}
                                size={14}
                                color={filter === option.label ? "#1d4ed8" : "#6b7280"}
                            />
                            <Text
                                className={`ml-1.5 text-sm font-medium ${filter === option.label
                                    ? "text-blue-700"
                                    : "text-gray-600"
                                    }`}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text className="text-gray-500 mt-2">Loading requests...</Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="p-4"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {filteredRequests.length > 0 ? (
                        <>
                            <Text className="text-sm font-medium text-gray-500 mb-3">
                                {filteredRequests.length} Requests Found
                            </Text>
                            {filteredRequests.map(request => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </>
                    ) : (
                        <View className="flex-1 items-center justify-center py-12">
                            <View className="bg-white p-6 rounded-xl items-center w-full">
                                <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-3">
                                    <Feather name="inbox" size={20} className="text-gray-400" />
                                </View>
                                <Text className="text-base font-semibold text-gray-900 text-center">
                                    No requests found
                                </Text>
                                <Text className="text-sm text-gray-500 text-center mt-1 mb-4">
                                    Try adjusting your filters
                                </Text>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        setFilter("All");
                                        setSearchQuery("");
                                    }}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default RequestHistory;
