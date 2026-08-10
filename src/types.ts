export interface ScanResult {
  styleName: string;
  'MCE%': string;
  biometricSpecs: string[];
  hypeText: string;
}

export interface CreditsResponse {
  userId: string;
  creditsRemaining: number;
  patreonUrl?: string;
}

export interface ScanApiResponse {
  success: boolean;
  scanResult?: ScanResult;
  creditsRemaining?: number;
  error?: string;
  needsPatreon?: boolean;
}
