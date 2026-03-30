import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 日付フィルタの共通型定義
interface DateFilter {
  targetField: string | null;
  year: string | null;
  month: string | null;
  week: string | null;
}

// DateFilterModal 用の Props 定義
interface DateProps {
  visible: boolean;
  onClose: () => void;
  filter: DateFilter;
  setFilter: React.Dispatch<React.SetStateAction<DateFilter>>;
  yearOptions: string[];
}

// 1. DateFilterModal の定義
export const DateFilterModal: React.FC<DateProps> = ({ 
  visible, onClose, filter, setFilter, yearOptions 
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>日付で絞り込む</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>検索する項目</Text>
            <View style={styles.chipRow}>
              {['面接日', '体験日', '採用日', '退店日'].map(f => (
                <TouchableOpacity 
                  key={f} 
                  style={[styles.chip, filter.targetField === f && styles.active]} 
                  onPress={() => setFilter(prev => ({...prev, targetField: f}))}
                >
                  <Text style={[styles.chipText, filter.targetField === f && {color:'#000'}]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>年（必須）</Text>
            <View style={styles.chipRow}>
              {yearOptions.map(y => (
                <TouchableOpacity 
                  key={y} 
                  style={[styles.chipS, filter.year === y && styles.active]} 
                  onPress={() => setFilter(prev => ({...prev, year: y}))}
                >
                  <Text style={[styles.chipText, filter.year === y && {color:'#000'}]}>{y}年</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>月 (任意)</Text>
            <View style={styles.chipRow}>
              {Array.from({length: 12}, (_, i) => String(i + 1)).map(m => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.chipS, filter.month === m && styles.active]} 
                  onPress={() => setFilter(prev => ({...prev, month: prev.month === m ? null : m}))}
                >
                  <Text style={[styles.chipText, filter.month === m && {color:'#000'}]}>{m}月</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>週目 (任意)</Text>
            <View style={styles.chipRow}>
              {['1', '2', '3', '4', '5'].map(w => (
                <TouchableOpacity 
                  key={w} 
                  style={[styles.chipS, filter.week === w && styles.active]} 
                  onPress={() => setFilter(prev => ({...prev, week: prev.week === w ? null : w}))}
                >
                  <Text style={[styles.chipText, filter.week === w && {color:'#000'}]}>{w}週目</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.submit} 
              onPress={() => { 
                if(!filter.targetField || !filter.year) return Alert.alert("未入力", "項目と年は必須です"); 
                onClose(); 
              }}
            >
              <Text style={styles.submitText}>検索を適用</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// SortModal 用の Props 定義
interface SortProps {
  visible: boolean;
  onClose: () => void;
  sortType: string;
  setSortType: React.Dispatch<React.SetStateAction<any>>;
}

// 2. SortModal の定義
export const SortModal: React.FC<SortProps> = ({ 
  visible, onClose, sortType, setSortType 
}) => {
  const options = [
    { label: '標準順', value: 'default' },
    { label: '面接日が新しい順', value: 'interview_new' },
    { label: '面接日が古い順', value: 'interview_old' },
    { label: '年齢が低い順', value: 'age_asc' },
    { label: '年齢が高い順', value: 'age_desc' },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.sortContainer}>
          <Text style={styles.title}>並び替え順</Text>
          {options.map(o => (
            <TouchableOpacity 
              key={o.value} 
              style={[styles.sortItem, sortType === o.value && {backgroundColor:'rgba(212,175,55,0.05)'}]} 
              onPress={() => { setSortType(o.value); onClose(); }}
            >
              <Text style={[styles.sortText, sortType === o.value && {color:'#D4AF37'}]}>{o.label}</Text>
              {sortType === o.value && <Ionicons name="checkmark" size={20} color="#D4AF37" />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxHeight: '80%', backgroundColor: '#1A1A1A', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#2C2C2E' },
  sortContainer: { width: '80%', backgroundColor: '#1A1A1A', borderRadius: 25, padding: 20, borderWidth: 1, borderColor: '#2C2C2E' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#D4AF37', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  label: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', marginRight: 8, marginBottom: 8, backgroundColor: '#0A0A0A' },
  chipS: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#2C2C2E', marginRight: 6, marginBottom: 6, backgroundColor: '#0A0A0A' },
  active: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  chipText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  sortItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  sortText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  submit: { backgroundColor: '#D4AF37', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  submitText: { color: '#000', fontSize: 16, fontWeight: '900' },
});