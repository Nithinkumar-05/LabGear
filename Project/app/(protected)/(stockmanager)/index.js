import { View, Text, Button } from 'react-native';
import { useAuth } from '@/routes/AuthContext';

export default function AdminDashboard() {
  const { logout } = useAuth();
  return (
    <View>
      <Text>Stock Manager Dashboard</Text>
      {/* Corrected Button with a title prop */}
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
