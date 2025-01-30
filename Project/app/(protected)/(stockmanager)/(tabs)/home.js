import { View,Text,Button } from 'react-native';
import { useAuth } from '@/routes/AuthContext';

const Home = () => {
    const {logout,user}= useAuth();
    return ( <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-semibold">Home of Stock Manager</Text>
        <Text className="text-lg mb-6">Role: {user.role}</Text>
        <Button title="Logout" onPress={logout} />
    </View> );
}
 
export default Home;