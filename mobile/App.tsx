import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabase';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PrivacyScreen } from './src/screens/PrivacyScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';

export type RootStackParamList = { Auth: undefined; Onboarding: undefined; Dashboard: undefined; Privacy: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return supabase.auth.onAuthStateChange((_event, next) => setSession(next)).data.subscription.unsubscribe;
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? <Stack.Screen name="Auth" component={AuthScreen} /> : !onboarded ? (
          <Stack.Screen name="Onboarding">{props => <OnboardingScreen {...props} onDone={() => setOnboarded(true)} />}</Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
