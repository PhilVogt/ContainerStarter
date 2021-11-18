import { fin } from 'openfin-adapter/src/mock';
import { init as initialisePlatform } from './platform';

export async function init() {
    console.log("Initialising platform");
    await fin.Platform.init({
    });
} 