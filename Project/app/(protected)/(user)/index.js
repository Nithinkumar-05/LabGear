// app/(protected)/(admin)/index.js
import { View, Text,Button } from 'react-native';
import { useAuth } from '../../../routes/AuthContext';

export default function UserDashboard() {
  const {logout} = useAuth();
  return (
      <View>
        <Text>User Dashboard</Text>
        <Button title="Logout" onPress={logout}/>
      </View>
  );
}