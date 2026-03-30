import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  fieldKey: string;
  value: any;
  isEditing: boolean;
  options?: string[];
  type?: 'text' | 'date'; // 日付用のタイプを追加
  onChange: (key: string, value: string) => void;
  isDark?: boolean;
}

export default function EditableRow({ label, fieldKey, value, isEditing, options, type = 'text', onChange, isDark }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const displayValue = value ? String(value) : '';

  // 編集モードではない場合は、テキスト表示のみ
  if (!isEditing) {
    return (
      <View style={[styles.row, isDark && styles.darkRow]}>
        <Text style={[styles.label, isDark && styles.darkText]}>{label}</Text>
        <Text style={[styles.value, isDark && styles.darkText]}>{displayValue || '未入力'}</Text>
      </View>
    );
  }

  // ① カレンダー（日付）入力モード
  if (type === 'date') {
    const currentDate = displayValue && !isNaN(new Date(displayValue).getTime()) ? new Date(displayValue) : new Date();

    const onChangeDate = (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') setShowDatePicker(false);
      if (selectedDate) {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        onChange(fieldKey, `${yyyy}/${mm}/${dd}`);
      }
    };

    return (
      <View style={[styles.row, isDark && styles.darkRow]}>
        <Text style={[styles.label, isDark && styles.darkText]}>{label}</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: displayValue ? '#FFF' : '#94A3B8' }}>{displayValue || '日付を選択...'}</Text>
        </TouchableOpacity>

        {/* Androidは標準ダイアログが開く、iOSはモーダルで下からスッと出す */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker value={currentDate} mode="date" display="default" locale="ja-JP" onChange={onChangeDate} />
        )}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal transparent={true} animationType="slide">
            <View style={styles.iosPickerOverlay}>
              <View style={styles.iosPickerContainer}>
                <DateTimePicker value={currentDate} mode="date" display="spinner" locale="ja-JP" textColor="#FFF" onChange={onChangeDate} />
                <TouchableOpacity style={styles.iosPickerDoneBtn} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosPickerDoneText}>決定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // ② ドロップダウン（選択肢）入力モード
  if (options && options.length > 0) {
    return (
      <View style={[styles.row, isDark && styles.darkRow]}>
        <Text style={[styles.label, isDark && styles.darkText]}>{label}</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowPicker(true)}>
          <Text style={{ color: displayValue ? '#FFF' : '#94A3B8' }}>{displayValue || '選択してください...'}</Text>
        </TouchableOpacity>
        
        <Modal visible={showPicker} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{label}を選択</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.optionBtn} 
                    onPress={() => { onChange(fieldKey, item); setShowPicker(false); }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.closeBtnText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ③ 通常のキーボード入力モード
  return (
    <View style={[styles.row, isDark && styles.darkRow]}>
      <Text style={[styles.label, isDark && styles.darkText]}>{label}</Text>
      <TextInput
        style={styles.input}
        value={displayValue}
        onChangeText={(text) => onChange(fieldKey, text)}
        placeholder={`${label}を入力`}
        placeholderTextColor="#666"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  darkRow: { borderColor: '#334155' },
  label: { width: 110, fontSize: 13, fontWeight: 'bold', color: '#333' },
  darkText: { color: '#94A3B8' },
  value: { flex: 1, fontSize: 14, color: '#000' },
  inputBox: { flex: 1, backgroundColor: '#1E293B', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  input: { flex: 1, backgroundColor: '#1E293B', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  
  // ドロップダウン用
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', padding: 20 },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  optionBtn: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  optionText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
  closeBtn: { marginTop: 20, padding: 15, backgroundColor: '#334155', borderRadius: 10 },
  closeBtnText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  // iOSカレンダー用
  iosPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  iosPickerContainer: { backgroundColor: '#1E293B', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  iosPickerDoneBtn: { marginTop: 15, padding: 15, backgroundColor: '#38BDF8', borderRadius: 10 },
  iosPickerDoneText: { color: '#000', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});