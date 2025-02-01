import React from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const CustomKeyboard = ({ 
  children, 
  scrollViewProps = {},
  dismissKeyboardOnTap = true,
  style,
  ...keyboardAvoidingViewProps 
}) => {
  const isIOS = Platform.OS === 'ios';

  const content = (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, scrollViewProps.contentContainerStyle]}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaProvider>
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      style={[styles.container, style]}
      keyboardVerticalOffset={isIOS ? 0 : 20}
      {...keyboardAvoidingViewProps}
    >
      {dismissKeyboardOnTap ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {content}
        </TouchableWithoutFeedback>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default CustomKeyboard;