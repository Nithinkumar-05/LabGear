import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Using Material Icons

export default function NotificationsScreen() {
    return (


        <ScrollView className="flex-1 bg-white">
            <View className="p-6">
                <View>
                    <View style={styles.container}>
                        <MaterialIcons name="" size={80} color="#aaa" />
                        <Text style={styles.message}>All clear here</Text>
                    </View>
                </View>
            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        color: "#555",
        marginTop: 10,
    },
});
