/**
 * Icon Helper Utility
 * Provides safe icon loading with fallback support
 */

import { Image } from 'react-native';
import { Asset } from 'expo-asset';

// Preload critical icons
const iconAssets = {
  logo: require('../assets/icons/logo.png'),
  adoptPet: require('../assets/icons/adopt_pet_icon.png'),
  readingMaterials: require('../assets/icons/reading_materials_icon.png'),
  registerPet: require('../assets/icons/register_pet_icon.png'),
  reportIncident: require('../assets/icons/report_icon.png'),
  qrCode: require('../assets/icons/qr_icon.png'),
  vetLogo: require('../assets/icons/vet_logo.png'),
};

/**
 * Preload all app icons
 * Call this during app initialization
 */
export const preloadIcons = async () => {
  try {
    const imageAssets = Object.values(iconAssets).map(icon => {
      return Asset.fromModule(icon).downloadAsync();
    });
    await Promise.all(imageAssets);
    // Icons preloaded successfully
  } catch (error) {
    // Error preloading icons - will load on demand
  }
};

/**
 * Get icon source with fallback
 * @param {string} iconName - Name of the icon
 * @returns {object} Icon source or fallback
 */
export const getIcon = (iconName) => {
  return iconAssets[iconName] || iconAssets.logo;
};

/**
 * Get image dimensions
 * @param {any} source - Image source (require or URI)
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageSize = (source) => {
  return new Promise((resolve, reject) => {
    if (typeof source === 'number') {
      // Local asset
      const asset = Asset.fromModule(source);
      asset.downloadAsync().then(() => {
        resolve({ width: asset.width, height: asset.height });
      }).catch(reject);
    } else if (typeof source === 'object' && source.uri) {
      // Remote URI
      Image.getSize(source.uri, (width, height) => {
        resolve({ width, height });
      }, reject);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
};

/**
 * Safe image loader component props
 * Adds error handling and fallback
 */
export const getImageProps = (source, fallbackSource = iconAssets.logo) => {
  return {
    source,
    defaultSource: fallbackSource,
    onError: (error) => {
      if (__DEV__) {
        console.warn('Image load error:', error.nativeEvent?.error || 'Unknown error');
      }
    },
  };
};

export default {
  preloadIcons,
  getIcon,
  getImageSize,
  getImageProps,
  icons: iconAssets,
};
