import { useState } from 'react';
import { Banner } from 'react-native-paper';
const CustomBanner = ({ text }) => {
    const [visible, setVisible] = useState(true);

    return (
        <Banner
            visible={visible}
            actions={[
                {
                    label: 'Ignbore',
                    onPress: () => setVisible(false),
                }
            ]}
            theme={{ primaryColor: '#000' }}
        >
            {text}
        </Banner>
    );
};

export default CustomBanner;