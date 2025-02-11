import * as React from 'react';
import { View } from 'react-native';
import { Snackbar } from 'react-native-paper';

const SnackBar = ({ message }) => {
    const [visible, setVisible] = React.useState(false);

    const onToggleSnackBar = () => setVisible(!visible);

    const onDismissSnackBar = () => setVisible(false);

    return (
        <View className="flex-1 justify-center items-center">
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
            >
                {message}
            </Snackbar>
        </View>
    );
};
export default SnackBar;