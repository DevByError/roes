import type { ExpoConfig } from "expo/config";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
const cleartext = !apiUrl.startsWith("https://");

const config: ExpoConfig = {
  "name": "ROES",
  "slug": "roes",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/images/icon.png",
  "scheme": "roes",
  "userInterfaceStyle": "automatic",
  "android": {
    "package": "com.roes.app",
    "adaptiveIcon": {
      "backgroundColor": "#D4D3E3",
      "foregroundImage": "./assets/images/android-icon-foreground.png",
      "backgroundImage": "./assets/images/android-icon-background.png",
      "monochromeImage": "./assets/images/android-icon-monochrome.png"
    },
    "predictiveBackGestureEnabled": false
  },
  "ios": {
    "bundleIdentifier": "com.roes.app",
    "supportsTablet": false
  },
  "web": {
    "output": "single",
    "favicon": "./assets/images/favicon.png"
  },
  "plugins": [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#D4D3E3",
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 220
      }
    ],
    [
      "expo-image-picker",
      {
        "photosPermission": "ROES uses your photos so you can choose a profile picture."
      }
    ]
  ],
  "experiments": {
    "reactCompiler": true
  }
};

config.plugins = [
  ...(config.plugins ?? []),
  "expo-secure-store",
  ["expo-build-properties", { android: { usesCleartextTraffic: cleartext } }],
];

export default config;
