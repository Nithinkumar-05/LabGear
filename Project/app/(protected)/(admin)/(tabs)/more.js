import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/routes/AuthContext';
export default function More() {
    const {logout} = useAuth();
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">More Screen</Text>
      <TouchableOpacity onPress={logout} className="bg-black rounded-xl px-6 py-3">
        <Text className="text-white text-base font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}