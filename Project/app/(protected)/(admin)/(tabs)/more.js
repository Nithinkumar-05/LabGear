import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/routes/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MenuItem = ({ iconName, title, onPress, showBorder = true }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center px-4 py-4"
  >
    <View className="w-8 h-8 justify-center items-center">
      <MaterialIcons name={iconName} size={24} color="#374151" />
    </View>
    <Text className="flex-1 text-base text-gray-800 ml-3">{title}</Text>
    <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
  </TouchableOpacity>
);

const SectionTitle = ({ title }) => (
  <Text className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
    {title}
  </Text>
);

export default function More() {
  const { logout } = useAuth();
  const appVersion = "1.0.0";
  const router = useRouter();

  const navigateToScreen = (screenName) => {
    router.push({
      pathname: `/(admin)/${screenName}`
    });
  };

  const handleLogOut = async () => {
    try {
      await logout();

    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally handle logout error here
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="py-6 px-4 bg-white">
        <Text className="text-2xl font-bold text-gray-900">More</Text>
      </View>

      <SectionTitle title="FEATURES" />
      <MenuItem
        iconName="account-balance-wallet"
        title="Track Budget"
        onPress={() => navigateToScreen('trackbudget')}
      />
      <SectionTitle title="ACCOUNT" />
      <MenuItem
        iconName="person-outline"
        title="Profile Settings"
        onPress={() => navigateToScreen('Profile')}
      />
      <MenuItem
        iconName="lock-outline"
        title="Change Password"
        onPress={() => navigateToScreen('ChangePassword')}
      />
      <MenuItem
        iconName="notifications-none"
        title="Notifications"
        onPress={() => navigateToScreen('notificationpreferences')}
      />

      <SectionTitle title="SUPPORT" />
      <MenuItem
        iconName="help-outline"
        title="Help & Support"
        onPress={() => navigateToScreen('Support')}
      />
      <MenuItem
        iconName="info-outline"
        title="About"
        onPress={() => navigateToScreen('About')}
      />
      <View className="px-4 py-2">
        <Text className="text-sm text-gray-500">App Version {appVersion}</Text>
      </View>

      <View className="mt-4 mb-8 px-4">
        <TouchableOpacity
          onPress={handleLogOut}
          className="bg-red-500 rounded-xl py-3 px-4"
        >
          <Text className="text-white text-center font-medium">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}