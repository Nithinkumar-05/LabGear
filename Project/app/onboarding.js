import React, { useRef, useState } from "react";
import { FlatList, Text, View, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import FontAwesome from '@expo/vector-icons/FontAwesome';
const { width } = Dimensions.get("window");
import { useRouter } from "expo-router";
const CarouselDots = ({ data, activeIndex }) => {
    return (
        <View className="flex-row justify-center items-center space-x-2 mt-4  bottom-28">
            {data.map((_, index) => (
                <View
                    key={index}
                    className={`h-2 w-2 rounded-full m-1 ${activeIndex === index ? "bg-gray-800 w-4" : "bg-gray-300"
                        }`}
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
        <View className="flex-1">
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
                    <View style={{ width }} className="p-4 justify-center items-center">
                        {item.icon}

                        <Text className="text-xl font-bold text-gray-900 m-4">{item.title}</Text>
                        <Text className="text-base text-gray-600">{item.description}</Text>

                    </View>
                )
                }
            />

            < CarouselDots data={flatlist_data} activeIndex={activeIndex} />

            <View className="flex-row justify-between items-center p-4">
                <Button
                    // theme={{ colors: { primary: "blue" } }}
                    mode="outlined"
                    onPress={() => { router.replace("/signIn") }}
                >Skip</Button>
                <Button
                    mode="contained"
                    // theme={{ colors: { primary: "blue" } }}
                    onPress={() => {
                        if (activeIndex === 2) {
                            AsyncStorage.setItem("onboarding", "true");
                            router.replace("/signIn");
                        } else {
                            flatListRef.current.scrollToIndex({ index: activeIndex + 1 });
                        }
                    }}>{activeIndex === 2 ? "Sign In" : "Next"}</Button>
            </View>
        </View >
    );
}