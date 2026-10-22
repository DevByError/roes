# ROES mobile app

Expo / React Native for admins and residents. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the back end (use your computer's LAN IP for a physical phone, `http://10.0.2.2:4000` for the Android emulator). Use an `https://` URL for production builds.

`npm install`, `npx expo start`. Android build: `eas build -p android --profile preview`.
