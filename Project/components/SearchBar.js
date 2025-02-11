import { Searchbar } from "react-native-paper";
import { View } from "react-native";

export default function Search({ placeholder, searchQuery, setSearchQuery, height = 48, width = "100%" }) {
  return (
    <View className="flex-row items-center mb-4">
      <View className="flex-1">
        <Searchbar
          placeholder={placeholder}
          rippleColor="#3b82f6"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: '#fff',
            height,
            width,
            borderRadius: 100,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
          }}
          inputStyle={{
            paddingVertical: 0,
            marginLeft: -4,
            height: height - 8,
            color: '#1f2937',
            fontSize: 14,
            textAlignVertical: 'center',
            alignSelf: 'center'
          }}
          iconStyle={{
            marginLeft: 4,
            alignSelf: 'center'
          }}
          iconColor="#3b82f6"
          placeholderTextColor="#9ca3af"
          theme={{
            colors: {
              primary: '#3b82f6',
              placeholder: '#9ca3af',
            }
          }}
        />
      </View>
    </View>
  );
}