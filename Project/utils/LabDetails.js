import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { Alert } from 'react-native';
import {labsRef} from '@/firebaseConfig';

const useLabDetails = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLabDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const labsSnapshot = await getDocs(query(labsRef));
            const labsData = labsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setLabs(labsData);
            return labsData;
        } catch (error) {
            const errorMessage = 'Failed to fetch lab details';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch labs when component mounts
    useEffect(() => {
        getLabDetails();
    }, [getLabDetails]);

    const refreshLabs = () => {
        return getLabDetails();
    };

    return {
        labs,
        loading,
        error,
        refreshLabs
    };
};

export default useLabDetails;