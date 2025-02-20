import React, { useState, useEffect } from "react";
import { requestsRef } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import RequestDetails from "@/components/RequestDetails";
import { useLocalSearchParams } from "expo-router";
import SkeletonLoader from "@/components/SkeletonLoader";
export default function RequestSummary() {

    const { requestId } = useLocalSearchParams();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId) return;
            try {
                const docRef = doc(requestsRef, requestId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRequest({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("Request not found.");
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [requestId]);

    return (
        loading ? <SkeletonLoader /> : <RequestDetails request={request} />
    );
}
