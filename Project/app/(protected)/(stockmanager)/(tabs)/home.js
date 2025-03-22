import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/routes/AuthContext';
import HomeLoader from '@/components/HomeLoader';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const Home = () => {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [recentRequests, setRecentRequests] = useState([]);
    const [lowStockEquipment, setLowStockEquipment] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentRequests = async () => {
            try {
                const requestsRef = collection(db, "Requests");
                const q = query(requestsRef, orderBy("createdAt", "desc"), limit(5));
                const querySnapshot = await getDocs(q);
                const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecentRequests(requests);
            } catch (err) {
                setError("Failed to load recent requests.");
                console.error(err);
            }
        };

        const fetchLowStockEquipment = async () => {
            try {
                const equipmentRef = collection(db, "components");
                const q = query(equipmentRef, orderBy("quantity", "asc"), limit(5)); 
                const querySnapshot = await getDocs(q);
                const equipment = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLowStockEquipment(equipment);
            } catch (err) {
                setError("Failed to load low stock equipment.");
                console.error(err);
            }
        };

        fetchRecentRequests();
        fetchLowStockEquipment();
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <HomeLoader />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="flash-on" size={24} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Recent Requests</Text>
                </View>
                <FlatList
                    data={recentRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => router.push({
                                pathname: "/(stockmanager)/requestsummary",
                                params: { requestId: item.id },
                            })} // Navigate to request details
                        >
                            <Text style={styles.cardTitle}>{item.title || "No title"}</Text>
                            <Text style={styles.cardDescription}>{item.description || "No description"}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="inventory" size={24} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Low Stock Equipment</Text>
                </View>
                <FlatList
                    data={lowStockEquipment}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardDescription}>Current Stock: {item.quantity}</Text>
                        </View>
                    )}
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3b82f6",
        marginLeft: 8,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#3b82f6",
    },
    cardDescription: {
        fontSize: 14,
        color: "#6B7280",
    },
});

export default Home;