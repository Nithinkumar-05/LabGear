import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { SwipeRow } from 'react-native-swipe-list-view';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'New Message',
            description: 'Jane commented on your post',
            time: '2m ago',
            read: false,
            type: 'comment'
        },
        {
            id: '2',
            title: 'Friend Request',
            description: 'John wants to connect with you',
            time: '1h ago',
            read: false,
            type: 'friend'
        },
        {
            id: '3',
            title: 'System Update',
            description: 'Your account settings have been updated',
            time: '2h ago',
            read: true,
            type: 'system'
        }
    ]);

    const markAllAsRead = () => {
        setNotifications(currentNotifications =>
            currentNotifications.map(notification => ({
                ...notification,
                read: true
            }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications(current =>
            current.filter(notification => notification.id !== id)
        );
    };

    const markAsRead = (id) => {
        setNotifications(current =>
            current.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const getIconName = (type) => {
        switch (type) {
            case 'comment':
                return 'comment';
            case 'friend':
                return 'person-add';
            case 'system':
                return 'info';
            default:
                return 'notifications';
        }
    };

    const NotificationItem = ({ item }) => (
        <SwipeRow
            leftOpenValue={75}
            rightOpenValue={-75}
            className="mb-2"
        >
            {/* Hidden View */}
            <View className="flex-row justify-between items-center px-4">
                <Pressable
                    onPress={() => markAsRead(item.id)}
                    className="bg-blue-500 h-full justify-center items-center w-[75px]"
                >
                    <Text className="h-full text-white text-wrap flex-row items-center justify-center">Mark as read</Text>
                </Pressable>
                <Pressable
                    onPress={() => deleteNotification(item.id)}
                    className="bg-red-500 h-full justify-center items-center w-[75px]"
                >
                    <MaterialIcons name="delete" size={24} color="white" />
                </Pressable>
            </View>

            {/* Visible View */}
            <Pressable
                onPress={() => markAsRead(item.id)}
                className={`flex-row items-center p-4 bg-white ${!item.read ? 'bg-blue-50' : ''}`}
            >
                <View className="bg-gray-100 rounded-full p-2 mr-3">
                    <MaterialIcons
                        name={getIconName(item.type)}
                        size={24}
                        color="#4B5563"
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                        {item.title}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        {item.description}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                        {item.time}
                    </Text>
                </View>
                {!item.read && (
                    <View className="h-2 w-2 rounded-full bg-blue-500" />
                )}
            </Pressable>
        </SwipeRow>
    );

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">

                <Button
                    mode="text"
                    onPress={markAllAsRead}
                    className="self-end"
                    labelStyle={{ color: '#007AFF' }}
                >
                    Mark all as read
                </Button>
            </View>

            <View className="flex-1 p-4">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            item={notification}
                        />
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center mt-16">
                        <MaterialIcons
                            name="notifications-none"
                            size={80}
                            color="#A0AEC0"
                        />
                        <Text className="text-lg font-semibold text-gray-800 mt-4">
                            All clear here
                        </Text>
                        <Text className="text-sm text-gray-600 mt-2">
                            You have no new notifications at the moment
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}