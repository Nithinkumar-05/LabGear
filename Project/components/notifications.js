import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { SwipeRow } from 'react-native-swipe-list-view';
import "nativewind";

const Panel = ({ onSelectAll, onDelete, onMarkRead, selectedCount }) => {
    if (selectedCount === 0) return null;
    return (
        <View className="flex-row justify-around p-2 bg-gray-100">
            <Pressable className="flex-row items-center p-2" onPress={onSelectAll}>
                <MaterialIcons name="check-box" size={20} color="#007BFF" />
                <Text className="ml-2 text-gray-900">Select All</Text>
            </Pressable>
            <Pressable className="flex-row items-center p-2" onPress={onMarkRead}>
                <MaterialIcons name="mark-email-read" size={20} color="#28A745" />
                <Text className="ml-2 text-gray-900">Mark as Read</Text>
            </Pressable>
            <Pressable className="flex-row items-center p-2" onPress={onDelete}>
                <MaterialIcons name="delete" size={20} color="#DC3545" />
                <Text className="ml-2 text-gray-900">Delete</Text>
            </Pressable>
        </View>
    );
};

export default function NotificationsScreen() {
    const [selectedAll, setSelectedAll] = useState(false);
    const [notifications, setNotifications] = useState([
    ]);

    const toggleSelect = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, selected: !n.selected } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => (n.selected ? { ...n, read: true, selected: false } : n)));
    };

    const deleteNotification = () => {
        setNotifications(notifications.filter(n => !n.selected));
    };

    const selectedCount = notifications.filter(n => n.selected).length;

    const NotificationItem = ({ item }) => (
        <Pressable className={`flex-row items-center p-4 bg-white border-b border-gray-200 ${!item.read ? 'bg-blue-50' : ''}`} onPress={() => toggleSelect(item.id)}>
            <MaterialIcons name={item.selected ? "check-box" : "check-box-outline-blank"} size={24} color="#007BFF" className="mr-3" />
            <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
                <Text className="text-xs text-gray-500 mt-1">{item.time}</Text>
            </View>
            {!item.read && <View className="h-2 w-2 rounded-full bg-blue-500" />}
        </Pressable>
    );

    return (
        <View className="flex-1 bg-white">
            <Panel onSelectAll={() => setNotifications(notifications.map(n => ({ ...n, selected: !selectedAll })))} onDelete={deleteNotification} onMarkRead={markAllAsRead} selectedCount={selectedCount} />
            <ScrollView>
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem key={notification.id} item={notification} />
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center mt-16">
                        <MaterialIcons name="notifications-none" size={80} color="#A0AEC0" />
                        <Text className="text-lg font-semibold text-gray-800 mt-4">All clear here</Text>
                        <Text className="text-sm text-gray-600 mt-2">No new notifications</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
