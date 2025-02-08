import { View, Text, TouchableOpacity } from 'react-native';
import {useAuth} from '@/routes/AuthContext';
export default function More() {
  const {logout} = useAuth();
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">More Screen</Text>
      <TouchableOpacity className="bg-black shadow-lg rounded-xl p-3" onPress={logout}>
        <Text className="text-white text-center">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}