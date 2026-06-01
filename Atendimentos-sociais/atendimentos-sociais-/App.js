import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import Home from './src/screens/Home';
import Status01 from './src/screens/status01';
import Formulario from './src/screens/Formulario';

const Stack = createNativeStackNavigator();

export default function App() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerLeft: () => null,
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Image
              source={require('./src/assets/ONG2.png')}
              style={{ height: 100, width: 100 }}
              resizeMode="contain"
            />
          ),
          headerStyle: {
            backgroundColor: 'black',
            height: 80,
          },
          headerRight: () => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#222',
              padding: 10,
              borderRadius: 8,
              marginRight: '10%',
              borderWidth: 1,
              borderColor: 'white',
            }}>
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: online ? '#4caf50' : '#f44336',
              }} />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
                {online ? 'Online' : 'Offline'}
              </Text>
            </View>
          ),
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Status01" component={Status01} />
        <Stack.Screen name="Formulario" component={Formulario} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}