import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import InvoiceDetails from '@/components/InvoiceDetails';

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
            <View className="flex-1 justify-center items-center">
                <Text>Loading request data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">{error}</Text>
            </View>
        );
    }

    return (
        <InvoiceDetails requestData={requestData} />
    );
};
 
export default Invoice;