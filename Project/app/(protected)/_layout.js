// _layout.js
import { Stack } from 'expo-router';
import { useAuth } from '../../routes/AuthContext';
import ProtectedRoute from '../../utils/ProtectedRoute';

const Layout = () => {
  return (
    <Stack>
      {/* Public route */}



      <Stack.Screen
        name="(admin)"
        options={{
          headerShown: false,

        }}
      />

      <Stack.Screen
        name="(user)"
        options={{
          headerShown: false,

        }}
      />

      <Stack.Screen
        name="(stockmanager)"
        options={{
          headerShown: false,
        }}
      />

    </Stack>
  );
};

export default Layout;