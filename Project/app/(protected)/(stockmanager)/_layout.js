import { Stack } from "expo-router";

const _layout = () => {
    return ( <Stack>
        <Stack.Screen name="(tabs)"
            options = {
                {
                    headerShown: false, 
                }
            }
        />

        <Stack.Screen
            name="requestsummary"
            options={{ presentation: "fullScreenModal", title: "RequestSummary", animation: "slide_from_right" }}
        />
        <Stack.Screen
            name="trackBudget"
            options = {
                {
                    title: "Track Budget",
                    headerShown: true,
                }
        }/>
    </Stack> );
}
 
export default _layout;