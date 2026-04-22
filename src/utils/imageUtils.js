// src/utils/imageUtils.js
import * as ImageManipulator from 'expo-image-manipulator';

export const compressImage = async (uri, quality = 0.8, maxWidth = 1200) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    return uri; // Return original if compression fails
  }
};

// src/utils/formatters.js
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'م';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'ك';
  return num.toString();
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const slugify = (text) => {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};
