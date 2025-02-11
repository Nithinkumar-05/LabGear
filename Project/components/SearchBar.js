
import { Searchbar } from "react-native-paper";
// import { heightpercentage }
import { View } from "react-native";
export default function Search({ placeholder, searchQuery, setSearchQuery, height, width }) {

    return (
        <View className="flex-row items-center mb-4">
            <View className="shadow-xl elevation-5 flex-1">
                <Searchbar
                    placeholder={placeholder}
                    rippleColor={'#3b82f6'}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{
                        backgroundColor: '#fff',
                        height: height,
                        width: width,
                        borderRadius: 100,
                        elevation: 4,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}
                    inputStyle={{ color: '#1f2937' }}
                    iconColor="#3b82f6"
                />
            </View>
        </View>
    )
}