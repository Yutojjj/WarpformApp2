import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

const DropdownSelector = ({
  label, options, selectedValue, onSelect,
  error = false, required = false, flex = 1,
  suffix = "", placeholder = "選択 ▼", themeColor = '#FF77A9'
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      
      <TouchableOpacity 
        style={[styles.dropdownTrigger, error && styles.inputError]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, !selectedValue && { color: '#bbb' }]} numberOfLines={1}>
          {selectedValue ? `${selectedValue}${suffix}` : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColor }]}>{label}を選択</Text>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {options.map((item) => {
                const isSelected = selectedValue === item.toString();
                return (
                  <TouchableOpacity 
                    key={item.toString()} 
                    style={[styles.modalItem, isSelected && { backgroundColor: `${themeColor}15` }]} // 背景色を薄くする小技
                    onPress={() => { onSelect(item.toString()); setModalVisible(false); }}
                  >
                    <Text style={[styles.modalItemText, isSelected && { color: themeColor, fontWeight: 'bold' }]}>
                      {item}{suffix}
                    </Text>
                    {isSelected && <Text style={[styles.checkmark, { color: themeColor }]}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 14, marginHorizontal: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' },
  requiredTag: {
    ...fontSettings, fontSize: 10, color: '#fff', backgroundColor: '#FF3B30',
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8
  },
  dropdownTrigger: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 48,
    justifyContent: 'center'
  },
  inputError: { borderColor: '#FF3B30', borderWidth: 2 },
  dropdownText: { ...fontSettings, fontSize: 14, color: '#333', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  modalTitle: { ...fontSettings, fontSize: 16, fontWeight: 'bold' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { ...fontSettings, fontSize: 16, color: '#333' },
  checkmark: { fontWeight: 'bold', fontSize: 18 },
});

export default DropdownSelector;