import React, { useRef, useState } from "react";
import { FlatList, Text, View, Dimensions, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CarouselDots = ({ data, activeIndex }) => {
    return (
        <View style={styles.dotContainer}>
            {data.map((_, index) => (
                <View
                    key={index}
                    style={[styles.dot, activeIndex === index ? styles.activeDot : styles.inactiveDot]}
                />
            ))}
        </View>
    );
};

export default function OnBoarding() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);

    const flatlist_data = [
        { id: "1", title: "Digital Request Tracking", description: "Submit and track component requests in real-time. No more paper forms or missing requisitions. Get instant updates on request status.", icon: <FontAwesome name="clipboard" size={100} color="blue" /> },
        { id: "2", title: "Smart Inventory Alerts", description: "Receive automatic notifications when supplies run low. Stay ahead of shortages with predictive stock management.", icon: <FontAwesome name="bell" size={100} color="green" /> },
        { id: "3", title: "Usage Analytics", description: "Gain insights into lab resource utilization. Track consumption patterns and optimize inventory levels for different components.", icon: <FontAwesome name="pie-chart" size={100} color="purple" /> }
    ];

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems[0] != null) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={flatlist_data}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width }]}>
                        {item.icon}
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}
            />

            <CarouselDots data={flatlist_data} activeIndex={activeIndex} />

            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => { router.replace("/signIn") }}
                    style={styles.skipButton}
                >
                    Skip
                </Button>
                <Button
                    mode="contained"
                    onPress={() => {
                        if (activeIndex === 2) {
                            AsyncStorage.setItem("onboarding", "true");
                            router.replace("/signIn");
                        } else {
                            flatListRef.current.scrollToIndex({ index: activeIndex + 1 });
                        }
                    }}
                    style={styles.nextButton}
                >
                    {activeIndex === 2 ? "Sign In" : "Next"}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light background color
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937', // Dark text color
        marginVertical: 10,
    },
    description: {
        fontSize: 16,
        color: '#4B5563', // Medium gray text color
        textAlign: 'center',
        marginHorizontal: 20,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    dot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#3B82F6', // Active dot color
        width: 12,
    },
    inactiveDot: {
        backgroundColor: '#D1D5DB', // Inactive dot color
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    skipButton: {
        flex: 1,
        marginRight: 8,
    },
    nextButton: {
        flex: 1,
    },
});