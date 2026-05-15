import { Redirect } from 'expo-router';

export default function Index() {
  // M1: no auth yet, jump straight to home.
  return <Redirect href="/home" />;
}
