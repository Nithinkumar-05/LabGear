import React, { useEffect } from 'react';
import { useAuth } from '../routes/AuthContext';
import { Redirect, useSegments, useRouter } from 'expo-router';
import { View, Animated } from 'react-native';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start fade-in animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Check authentication and roles with segments
    const checkAuth = async () => {
      const currentSegment = segments[0] || '';
      
      if (!isAuthenticated) {
        // Fade out before redirecting
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          router.replace('/signIn');
        });
        return;
      }
      
      if (!allowedRoles.includes(user.role)) {
        console.log("From Protected Route - Current segment:", currentSegment);
        
        // Fade out before redirecting
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          switch (user.role) {
            case 'user':
              router.replace('/(protected)/(user)/');
              break;
            case 'admin':
              router.replace('/(protected)/(admin)/');
              break;
            case 'stock_manager':
              router.replace('/(protected)/(stockmanager)');
              break;
            default:
              router.replace('/signIn');
          }
        });
      }
    };
    
    checkAuth();
  }, [isAuthenticated, user, segments, allowedRoles]);
  
  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

export default ProtectedRoute;