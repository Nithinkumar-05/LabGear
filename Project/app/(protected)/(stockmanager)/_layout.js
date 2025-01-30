import { Stack } from "expo-router";

const _layout = () => {
    return ( <Stack>
        <Stack.Screen name="(tabs)"
            options = {
                {
                    headerShown: false, // Hide the header
                }
            }
        />
    </Stack> );
}
 
export default _layout;