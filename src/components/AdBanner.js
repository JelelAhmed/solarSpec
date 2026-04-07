/**
 * AdBanner — development placeholder for AdMob banner ads.
 * Displays a styled placeholder matching the design spec.
 * In production, swap this component body for the real BannerAd component.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Dimensions } from '../theme/index';
import { ADS } from '../constants/strings';

/**
 * Renders an AdMob banner placeholder (320×50).
 * @returns {JSX.Element}
 */
export default function AdBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{ADS.bannerLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.adBannerWidth,
    height: Dimensions.adBannerHeight,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.30)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.footnote,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(215,195,174,0.60)',
  },
});
