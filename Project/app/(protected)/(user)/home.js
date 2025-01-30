import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/routes/AuthContext';

const Home = () => {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Home of User</Text>
            <Text style={styles.welcomeText}>Welcome, {user?.username || 'User'}!</Text>
            <Text style={styles.roleText}>Role: {user?.role || 'N/A'}</Text>
            <Button title="Logout" onPress={logout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 5,
    },
    roleText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
});

export default Home;
