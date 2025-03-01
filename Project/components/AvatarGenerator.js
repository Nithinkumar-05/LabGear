import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
//Avatar Generator

const backgroundColors = [
    '#F44336', // Red
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#03A9F4', // Light Blue
    '#00BCD4', // Cyan
    '#009688', // Teal
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#FF9800', // Orange
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B', // Blue Grey
];

const getInitials = (name) => {
    if (!name) return '?';

    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    }

    return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
};

const generateConsistentColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % backgroundColors.length);
    return backgroundColors[index];
};

const Avatar = ({
    name,
    size,
    fontSize,
    animation = 'scale', // 'scale', 'fade', 'rotate', 'pulse'
    onPress = null
}) => {
    const initials = getInitials(name);
    const backgroundColor = generateConsistentColor(name);

    // Animation values
    const scaleAnim = new Animated.Value(0);
    const fadeAnim = new Animated.Value(0);
    const rotateAnim = new Animated.Value(0);
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        switch (animation) {
            case 'scale':
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }).start();
                break;

            case 'fade':
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
                break;

            case 'rotate':
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
                break;

            case 'pulse':
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
                break;
        }
    }, []);

    const getAnimatedStyle = () => {
        switch (animation) {
            case 'scale':
                return {
                    transform: [{ scale: scaleAnim }],
                };
            case 'fade':
                return {
                    opacity: fadeAnim,
                };
            case 'rotate':
                return {
                    transform: [
                        {
                            rotate: rotateAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                            }),
                        },
                    ],
                };
            case 'pulse':
                return {
                    transform: [{ scale: pulseAnim }],
                };
            default:
                return {};
        }
    };

    const TouchableComponent = onPress ? Animated.createAnimatedComponent(TouchableOpacity) : Animated.View;

    return (
        <TouchableComponent
            onPress={onPress}
            className="items-center justify-center rounded-full overflow-hidden"
            style={[
                {
                    backgroundColor,
                    width: size,
                    height: size,
                },
                getAnimatedStyle(),
                // style
            ]}
        >
            <Text
                className="text-white font-bold"
                style={[
                    {
                        fontSize,
                        lineHeight: fontSize * 1.2,
                    },
                    // textStyle
                ]}
            >
                {initials || ""}
            </Text>
        </TouchableComponent>
    );
};

export default Avatar;