//Banner
import { useState } from 'react';
import { View } from 'react-native';
import { Banner } from 'react-native-paper';
import { useRouter } from 'expo-router';
const CustomBanner = ({ text }) => {
    const [visible, setVisible] = useState(true);
    const router = useRouter();
    return (
        <View>
            <Banner
                visible={visible}
                actions={[
                    {
                        label: 'Dismiss',
                        onPress: () => setVisible(false),
                    },
                    {
                        label: 'Ok',
                        onPress: () => {
                            router.push("/(user)/editprofile"),
                                setVisible(false)
                        },
                    },

                ]}
                style={{ backgroundColor: '#fff' }}
                theme={{ primaryColor: '#000' }}
                elevation={1}
            >
                {text}
            </Banner >
        </View>

    );
};

export default CustomBanner;