import { View,Text,Button } from 'react-native';
import { useAuth } from '@/routes/AuthContext';

const Home = () => {
    const {logout,user}= useAuth();
    return ( <View>
        <Text>Home of Stock Manager</Text>
        <Text>Role:{user.role}</Text>
        <Button title="Logout" onPress={logout} />
    </View> );
}
 
export default Home;