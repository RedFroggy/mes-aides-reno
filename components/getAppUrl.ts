const ENV_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL; // URL principale de l’application
const MARDATA_URL = process.env.NEXT_PUBLIC_MARDATA_URL; // URL de l'API Mardata (côté serveur)

export default function getAppUrl(): string {
  return ENV_APP_BASE_URL
}

export function getServerUrl(): string {
  return MARDATA_URL;
}
