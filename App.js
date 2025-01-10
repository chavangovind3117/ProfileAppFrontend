// necessary libraries from React and React Native
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Provides navigation context to the app
import { createStackNavigator } from '@react-navigation/stack'; // Creates a stack-based navigation
import AsyncStorage from '@react-native-async-storage/async-storage';

// custom screens for the app
import LoginScreen from './screens/LoginScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import VerifyOTPScreen from './screens/VerifyOTPScreen';
import ProfileScreen from './screens/ProfileScreen';

// Initialize the stack navigator
const Stack = createStackNavigator();

const App = () => {

  const [initialRoute, setInitialRoute] = useState(null);

  const checkUserData = async () => {
    try {
      console.log("Checking user data in AsyncStorage...");
      const userData = await AsyncStorage.getItem('userData');
      console.log("User data retrieved:", userData);
      if (userData) {
        setInitialRoute('Profile');
      }
      else {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error("Error checking user data:", error);
      setInitialRoute('Login');
    }
  };
  useEffect(() => {
    checkUserData();
  }, []);

  if (!initialRoute) {
    // Render a loading screen or splash screen here 
    console.log("Loading initial route...");
    return null; // or <LoadingScreen />
  }

  return (
    // NavigationContainer manages the navigation tree and state
    <NavigationContainer>
      {/* Stack.Navigator manages the stack of screens */}
      <Stack.Navigator initialRouteName={initialRoute}>
        {/* Define each screen in the stack */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
