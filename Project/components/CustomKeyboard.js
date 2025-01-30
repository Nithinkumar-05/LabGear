import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const CustomKeyboard = ({ children }) => {
    const isIOS = Platform.OS === 'ios';

    return (
        <KeyboardAvoidingView
            behavior={isIOS ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default CustomKeyboard;