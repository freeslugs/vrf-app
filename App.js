import * as Font from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Text, View } from "react-native";
import { useEffect, useCallback } from "react";

import { StatusBar } from 'expo-status-bar';

import { AppRegistry } from 'react-native';
// import { PaperProvider } from 'react-native-paper';
import { name as appName } from './app.json';
import App from './src/App';

import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  "colors": {
    ...DefaultTheme.colors,

    "primary": "rgb(21, 29, 120)",
    // "onPrimary": "rgb(255, 255, 255)",
    // "primaryContainer": "rgb(240, 219, 255)",
    // "onPrimaryContainer": "rgb(44, 0, 81)",
    "secondary": "#F5B844",
    // "onSecondary": "rgb(21, 29, 120)",
    // "secondaryContainer": "rgb(237, 221, 246)",
    // "onSecondaryContainer": "rgb(33, 24, 42)",
    // "tertiary": "rgb(128, 81, 88)",
    // "onTertiary": "rgb(255, 255, 255)",
    // "tertiaryContainer": "rgb(255, 217, 221)",
    // "onTertiaryContainer": "rgb(50, 16, 23)",
    // "error": "rgb(186, 26, 26)",
    // "onError": "rgb(255, 255, 255)",
    // "errorContainer": "rgb(255, 218, 214)",
    // "onErrorContainer": "rgb(65, 0, 2)",
    // "background": "red",
    // "onBackground": "red",
    // the header 
    "surface": "rgb(21, 29, 120)", 
    "onSurface": "white",
    // "surfaceVariant": "rgb(233, 223, 235)",
    // "onSurfaceVariant": "rgb(74, 69, 78)",
    // "outline": "rgb(124, 117, 126)",
    // "outlineVariant": "rgb(204, 196, 206)",
    // "shadow": "rgb(0, 0, 0)",
    // "scrim": "rgb(0, 0, 0)",
    // "inverseSurface": "rgb(50, 47, 51)",
    // "inverseOnSurface": "rgb(245, 239, 244)",
    // "inversePrimary": "rgb(220, 184, 255)",
    // "elevation": {
    //   "level0": "transparent",
    //   "level1": "rgb(248, 242, 251)",
    //   "level2": "rgb(244, 236, 248)",
    //   "level3": "rgb(240, 231, 246)",
    //   "level4": "rgb(239, 229, 245)",
    //   "level5": "rgb(236, 226, 243)"
    // },
    // "surfaceDisabled": "rgba(29, 27, 30, 0.12)",
    // "onSurfaceDisabled": "rgba(29, 27, 30, 0.38)",
    // "backdrop": "red"
  }
}

export default function Main() {
  const [fontsLoaded] = Font.useFonts({
    "Inter-Black": require("./assets/fonts/Inter-Black.otf"),
    "Inter-SemiBoldItalic":
      "https://rsms.me/inter/font-files/Inter-SemiBoldItalic.otf?v=3.12",
     'TiltPrism-Regular': require('./assets/fonts/TiltPrism-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <View onLayout={onLayoutRootView} style={{flex: 1}}>
        <App/>
      </View>
    </PaperProvider>
  );
}

// AppRegistry.registerComponent(appName, () => Main);