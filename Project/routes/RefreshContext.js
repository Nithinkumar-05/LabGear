import React, { createContext, useState, useContext, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fetchData from "@/utils/GetData";
import { useAuth } from "@/routes/AuthContext";

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
    const { user } = useAuth();
    const [data, setData] = useState({ user: null, lab: null, requests: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const refreshData = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const fetchedData = await fetchData(user.uid);
            await AsyncStorage.setItem("cachedData", JSON.stringify(fetchedData));
            setData(fetchedData);
        } catch (err) {
            console.error("Error refreshing data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);
    React.useEffect(() => {
        const loadCachedData = async () => {
            try {
                const cachedData = await AsyncStorage.getItem("cachedData");
                if (cachedData) {
                    setData(JSON.parse(cachedData));
                }
            } catch (error) {
                console.error("Error loading cached data:", error);
            }
        };
        loadCachedData();
    }, []);

    return (
        <RefreshContext.Provider value={{ data, loading, error, refreshData }}>
            {children}
        </RefreshContext.Provider>
    );
};

export const useRefresh = () => {
    return useContext(RefreshContext);
};
