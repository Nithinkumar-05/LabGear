import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="items-center space-y-4">
        <AntDesign name="exclamationcircleo" size={64} color="#EF4444" />
        
        <Text className="text-3xl font-bold text-gray-900">
          Page Not Found
        </Text>
        
        <Text className="text-lg text-gray-600 text-center max-w-sm">
          Sorry, we couldn't find the page you're looking for.
        </Text>

       

        <TouchableOpacity
          onPress={() => router.replace('/signIn')}
          className="mt-4 flex-row items-center space-x-2"
        >
          <AntDesign name="home" size={20} color="black" />
          <Text className="text-black font-semibold text-lg">
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}