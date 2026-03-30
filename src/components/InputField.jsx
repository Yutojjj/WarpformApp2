import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

const InputField = ({
  label, placeholder, multiline = false, flex = 1,
  keyboardType = 'default', value, onChangeText,
  error = false, required = false, themeColor = '#FF77A9'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          error && styles.inputError,
          isFocused && { borderColor: themeColor, borderWidth: 2 }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        multiline={multiline}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        selectionColor={themeColor}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.errorText}>入力してください</Text>}
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
  input: {
    ...fontSettings,
    backgroundColor: '#F9FAFB', // 汎用的な薄いグレー
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  inputError: { borderColor: '#FF3B30', borderWidth: 2 },
  errorText: { ...fontSettings, color: '#FF3B30', fontSize: 11, marginTop: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
});

export default InputField;