import { Platform, StyleSheet, Text, View } from 'react-native';

const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

const Section = ({ title, description, children, themeColor = '#FF77A9', isCentered = false }) => {
  return (
    <View style={styles.section}>
      <Text style={[
        styles.sectionTitle,
        { color: themeColor },
        isCentered ? { textAlign: 'center' } : { borderLeftWidth: 4, borderLeftColor: themeColor, paddingLeft: 10 }
      ]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.sectionDescription, isCentered && { textAlign: 'center' }]}>
          {description}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...fontSettings,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionDescription: {
    ...fontSettings,
    fontSize: 11,
    color: '#888',
    marginBottom: 16,
  },
});

export default Section;