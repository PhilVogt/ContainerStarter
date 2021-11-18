import { AppMonitor } from "./app-monitor";
import { init as initialisePlatform } from './platform';

window.addEventListener('DOMContentLoaded', async () => {
  console.info("Starting Kibana Log Monitor");
  const appMonitor = new AppMonitor(10000);
  appMonitor.startMonitoring();

  await initialisePlatform();
});