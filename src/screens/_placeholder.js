// Placeholder screen factory — replaced screen-by-screen in Phase 5+
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Creates a minimal placeholder screen for navigation verification.
 * @param {string} name - Screen display name
 * @param {string} nextScreen - Next screen to navigate to (optional)
 * @returns {Function} React component
 */
export const makePlaceholder = (name, nextScreen) =>
  function PlaceholderScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{name}</Text>
        {nextScreen && (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate(nextScreen)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnText}>→ {nextScreen}</Text>
          </TouchableOpacity>
        )}
        {name !== 'Home' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5A623',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#2A2A2A',
  },
  btnText: {
    color: '#452B00',
    fontSize: 16,
    fontWeight: '700',
  },
});
