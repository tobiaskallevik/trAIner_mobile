declare module 'freerasp-react-native';

// declare module 'freerasp-react-native' {
//     // Define the configuration type for the app
//     interface AppConfig {
//       androidConfig: {
//         packageName: string;
//         certificateHashes: string[];
//         supportedAlternativeStores: string[];
//       };
//       iosConfig?: {
//         appBundleId: string;
//         appTeamId: string;
//       };
//       watcherMail: string;
//       isProd: boolean;
//     }
  
//     // Define the actions type for reactions to threats
//     interface AppActions {
//       privilegedAccess: () => void;
//       debug: () => void;
//       simulator: () => void;
//       appIntegrity: () => void;
//       unofficialStore: () => void;
//       hooks: () => void;
//       deviceBinding: () => void;
//       secureHardwareNotAvailable: () => void;
//       passcode: () => void;
//       deviceID?: () => void; // Optional as it's iOS only
//       obfuscationIssues?: () => void; // Optional as it's Android only
//     }
  
//     // Declare the useFreeRasp function with detailed parameter types
//     export function useFreeRasp(config: AppConfig, actions: AppActions): void;
//   }