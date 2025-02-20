import { useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import { requestsRef } from '@/firebaseConfig';

const useRequestDetails = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const requestsSnapshot = await getDocs(requestsRef);
                const requestsList = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRequests(requestsList);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    return { requests, loading, error };
};

export default useRequestDetails;
