import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

const MultiSelectButtons = ({
  label, options, selectedValues = [], onToggle,
  error = false, required = false, themeColor = '#FF77A9'
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      <View style={[styles.buttonRow, error && styles.errorBorder]}>
        {options.map((opt) => {
          const isActive = selectedValues.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.selectBtn,
                isActive ? { backgroundColor: themeColor, borderColor: themeColor } : styles.selectBtnInactive
              ]}
              onPress={() => onToggle(opt)}
            >
              <Text style={[
                styles.selectBtnText,
                isActive ? { color: '#fff' } : { color: themeColor }
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>選択してください</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' },
  requiredTag: {
    ...fontSettings,
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 },
  errorBorder: { borderWidth: 2, borderColor: '#FF3B30', borderRadius: 8, padding: 2 },
  selectBtn: {
    flexGrow: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    margin: 3,
  },
  selectBtnInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  selectBtnText: { ...fontSettings, fontSize: 12, fontWeight: 'bold' },
  errorText: { ...fontSettings, color: '#FF3B30', fontSize: 11, marginTop: 4 },
});

export default MultiSelectButtons;