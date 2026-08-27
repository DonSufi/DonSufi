module.exports = {
  expo: {
    // Rebranded from "DonSufi" to "Salla" -- this `name` is what's shown to
    // users (under the icon, in the app switcher, in store listings). The
    // slug/scheme/bundle identifiers below intentionally stay "donsufi":
    // they're invisible technical identifiers already tied to the live EAS
    // project and any already-installed development build, so changing them
    // would require a fresh EAS project and reinstalling on every device
    // for zero user-visible benefit.
    name: 'Salla',
    slug: 'donsufi',
    version: '1.0.0',
    scheme: 'donsufi',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.donsufi.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "DonSufi uses your location to calculate accurate prayer times and the Qibla direction for where you are. You can also enter your location manually instead.",
        UIBackgroundModes: [],
      },
    },
    android: {
      package: 'com.donsufi.app',
      adaptiveIcon: {
        backgroundColor: '#0B3D2E',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'RECEIVE_BOOT_COMPLETED',
        'SCHEDULE_EXACT_ALARM',
        'USE_EXACT_ALARM',
        'POST_NOTIFICATIONS',
        'VIBRATE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-localization',
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 180,
          resizeMode: 'contain',
          backgroundColor: '#0B3D2E',
        },
      ],
      'expo-task-manager',
      'expo-background-task',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'DonSufi uses your location to calculate accurate prayer times and the Qibla direction for where you are.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/android-icon-monochrome.png',
          color: '#0B3D2E',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      // Populated from the GOOGLE_PLACES_API_KEY environment variable so the
      // real key is never committed to source control. Locally, set it in a
      // git-ignored `.env` file (see `.env.example`); for EAS builds, set it
      // with `eas secret:create --scope project --name GOOGLE_PLACES_API_KEY
      // --value "..."` -- EAS injects project secrets as environment
      // variables during the build automatically. With no key set, this
      // resolves to an empty string and the mosque finder shows its
      // documented "not configured" state rather than failing silently.
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
      // Links this app to its EAS project (donsufi/donsufi on expo.dev), so
      // `eas build` and `eas update` know which cloud project to use. This
      // is a public project identifier, not a secret.
      eas: {
        projectId: 'db598883-aaad-45eb-ab05-c1165b7553e5',
      },
    },
  },
};
