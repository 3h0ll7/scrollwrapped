import React from 'react'; import { ActivityIndicator, View } from 'react-native'; import { colors } from '../theme/colors';
export function LoadingScreen(){ return <View style={{flex:1,backgroundColor:colors.background,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={colors.purple}/></View>; }
