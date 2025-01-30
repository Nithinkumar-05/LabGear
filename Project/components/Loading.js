import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { heightPercentageToDP as hp,widthPercentageToDP as wp } from 'react-native-responsive-screen';
const Loading = ({ size }) => {
    return (
        <View style={{ height: size, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LottieView
                source={require('../assets/images/pc.json')}
                autoPlay
                loop
                style={{ width: wp(12), height: hp(16) }}
            />
        </View>
    );
}

export default Loading;