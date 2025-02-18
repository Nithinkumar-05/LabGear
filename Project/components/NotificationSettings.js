import React, { useState } from "react";
import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function NotificationPreferences() {
    const [preferences, setPreferences] = useState({
        pushEnabled: true,
        schedule: {
            quiet: false,
            quietStart: '22:00',
            quietEnd: '07:00'
        }
    });

    const toggleMainSwitch = () => {
        setPreferences(prev => ({
            ...prev,
            pushEnabled: !prev.pushEnabled
        }));
    };

    const toggleCategory = (category) => {
        setPreferences(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: !prev.categories[category]
            }
        }));
    };

    const PreferenceItem = ({ title, description, value, onToggle, icon }) => (
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center flex-1">
                <View className="bg-gray-100 rounded-full p-2 mr-3">
                    <MaterialIcons name={icon} size={24} color="#4B5563" />
                </View>
                <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-gray-900">
                        {title}
                    </Text>
                    {description && (
                        <Text className="text-sm text-gray-600 mt-1">
                            {description}
                        </Text>
                    )}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={value ? "#2563EB" : "#9CA3AF"}
            />
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Main Toggle */}
            <View className="mb-6">
                <PreferenceItem
                    title="Push Notifications"
                    description="Enable or disable all push notifications"
                    value={preferences.pushEnabled}
                    onToggle={toggleMainSwitch}
                    icon="notifications"
                />
            </View>


            {/* Quiet Hours Section */}
            <View>
                <Text className="px-4 pb-2 text-sm font-medium text-gray-500 uppercase">
                    Quiet Hours
                </Text>

                <PreferenceItem
                    title="Do Not Disturb"
                    description={`Mute notifications from ${preferences.schedule.quietStart} to ${preferences.schedule.quietEnd}`}
                    value={preferences.schedule.quiet}
                    onToggle={() => setPreferences(prev => ({
                        ...prev,
                        schedule: {
                            ...prev.schedule,
                            quiet: !prev.schedule.quiet
                        }
                    }))}
                    icon="nightlight-round"
                />
            </View>

            {/* Additional Info */}
            <View className="p-4 mt-4">
                <Text className="text-sm text-gray-500 text-center">
                    You can also manage notification settings in your device's system settings
                </Text>
            </View>
        </ScrollView>
    );
}