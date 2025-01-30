import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      {/* Define the home screen */}
      <Stack.Screen 
        name="home" 
        options={{
          title: "Home", // Title displayed in the header
          headerStyle: {
            backgroundColor: "#f8f9fa", // Custom header background color
          },
          headerTintColor: "#000", // Text color for the header
          
        }} 
      />
      <Stack.Screen
        name="index"
        title="Intial Page"
        options={{
            headerStyle: {
                backgroundColor: "#f8f9", // Custom header background color   
                },
                headerTintColor: "#000", // Text color for the header
            }}/>
    </Stack>
  );
};

export default _layout;
