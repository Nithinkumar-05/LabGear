import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, Animated } from 'react-native';

export default function SplashScreen() {
  const [progress] = useState(new Animated.Value(0));
  const router = useRouter();
  useEffect(() => {
    // Animate the progress bar over 3 seconds
    Animated.timing(progress, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Navigate to the next screen after 3 seconds
    const timeout = setTimeout(() => {
        router.replace('signIn');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Image
        source={require('../assets/images/lab_gear.jpg')}
        className="w-[200px] h-[200px]"
        resizeMode="contain"
      />

      {/* Progress bar container */}
      <View className="w-[200px] h-[5px] bg-gray-200 rounded-full mt-8 overflow-hidden">
        <Animated.View
          style={{ width: progressWidth, height: '100%', backgroundColor: '#6a0dad' }}
        />
      </View>
    </View>
  );
}
