import { Tabs,Redirect } from "expo-router";
import { Ionicons,AntDesign } from '@expo/vector-icons';
import CustomHeader from "@/components/CustomHeader";
import { useAuth } from "@/routes/AuthContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) return null; // Ensure user data is loaded
  // if(user.role!=='admin'){
  //   if(user.role==='stock_manager')
  //     return <Redirect href={'/(protected)/(stockmanager)/'}/>
  //   else if(user.role==='user')
  //     return <Redirect href={'/(protected)/(user)/'}/>
  //   else
  //     return <Redirect href={"/signIn"}/>
  // }
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Tabs initialRouteName="home">
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            header: () => <CustomHeader />,
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: "Programmers",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
            header: () => <CustomHeader />,
          }}
        />
        <Tabs.Screen
          name="equipment"
          options={
            {
              title:"Equipment",
              tabBarIcon:({color,size})=>(
                <AntDesign name="shoppingcart" size={size} color={color} />
              ),header:()=><CustomHeader/>,
              tabBarHideOnKeyboard:true,

            }
          }/>
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ellipsis-horizontal" size={size} color={color} />
              ),
              header: () => <CustomHeader />,
              }}
              />
      </Tabs>
      </ProtectedRoute>
  );
}
