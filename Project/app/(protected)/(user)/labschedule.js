import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const subjects = [
    { name: "C Programming", instructor: "Dr. A. Sharma" },
    { name: "Java", instructor: "Prof. B. Singh" },
    { name: "Mobile App Development", instructor: "Dr. C. Verma" },
    { name: "Linux", instructor: "Prof. D. Gupta" },
    { name: "DBMS", instructor: "Dr. E. Reddy" },
    { name: "Web Engineering", instructor: "Prof. F. Mehta" },
];

const scheduleData = [
    { day: "Monday", sessions: [{ subject: subjects[0], time: "9:00 AM - 12:00 PM" }, { subject: subjects[1], time: "1:00 PM - 3:30 PM" }] },
    { day: "Tuesday", sessions: [{ subject: subjects[2], time: "10:00 AM - 1:00 PM" }, { subject: subjects[3], time: "1:00 PM - 3:30 PM" }] },
    { day: "Wednesday", sessions: [{ subject: subjects[4], time: "9:00 AM - 12:00 PM" }, { subject: subjects[5], time: "1:00 PM - 3:30 PM" }] },
    { day: "Thursday", sessions: [{ subject: subjects[0], time: "10:00 AM - 1:00 PM" }, { subject: subjects[2], time: "1:00 PM - 3:30 PM" }] },
    { day: "Friday", sessions: [{ subject: subjects[1], time: "9:00 AM - 12:00 PM" }, { subject: subjects[3], time: "1:00 PM - 3:30 PM" }] },
    { day: "Saturday", sessions: [{ subject: subjects[5], time: "10:00 AM - 1:00 PM" }, { subject: subjects[4], time: "1:00 PM - 3:30 PM" }] },
];

const LabSchedule = ({ labid }) => {
    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.day}</Text>
            {item.sessions.map((session, index) => (
                <View key={index} style={styles.cell}>
                    <Text style={styles.subjectText}>{session.subject.name}</Text>
                    <Text style={styles.timeText}>{session.time}</Text>
                    <Text style={styles.instructorText}>Instructor: {session.subject.instructor}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerCell}>Day</Text>
                    <Text style={styles.headerCell}>Forenoon</Text>
                    <Text style={styles.headerCell}>Afternoon</Text>
                </View>
                <FlatList
                    data={scheduleData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.day}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    table: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#3B82F6",
        borderRadius: 8,
        marginBottom: 8,
    },
    headerCell: {
        flex: 1,
        color: "#FFFFFF",
        fontWeight: "bold",
        padding: 12,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        marginBottom: 8,
    },
    cell: {
        flex: 1,
        padding: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 4,
        marginRight: 4,
        backgroundColor: "#F9FAFB",
    },
    subjectText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#3B82F6",
    },
    timeText: {
        fontSize: 14,
        color: "#6B7280",
    },
    instructorText: {
        fontSize: 14,
        color: "#4B5563",
    },
});

export default LabSchedule;