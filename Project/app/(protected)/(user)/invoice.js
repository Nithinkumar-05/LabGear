import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import InvoiceDetails from '@/components/InvoiceDetails';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Invoice = () => {
    const params = useLocalSearchParams();
    const requestId = params.requestId;
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequestData = async () => {
            if (!requestId) {
                setError("No request ID provided");
                setLoading(false);
                return;
            }

            try {
                const requestRef = doc(db, "approvedRequests", requestId);
                const requestSnapshot = await getDoc(requestRef);

                if (requestSnapshot.exists()) {
                    setRequestData({
                        id: requestSnapshot.id,
                        ...requestSnapshot.data(),
                        requestId: requestSnapshot.id
                    });
                } else {
                    setError("Request not found");
                }
            } catch (err) {
                console.error("Error fetching request data:", err);
                setError("Failed to load request data");
            } finally {
                setLoading(false);
            }
        };

        fetchRequestData();
    }, [requestId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading request data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={40} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <InvoiceDetails requestData={requestData} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444', // Red color for error messages
        textAlign: 'center',
        marginTop: 10,
    },
    scrollContainer: {
        paddingBottom: 16,
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default Invoice;