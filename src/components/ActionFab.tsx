import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onPreviewPDF: () => void;
  onDelete: () => void;
}

export default function ActionFab({ isOpen, setIsOpen, onPreviewPDF, onDelete }: Props) {
  return (
    <View style={styles.fabWrapper}>
      {isOpen && (
        <View style={styles.fabMenu}>
          <TouchableOpacity 
            style={styles.fabMenuItem} 
            onPress={() => { setIsOpen(false); onPreviewPDF(); }}
          >
            <Ionicons name="document-text-outline" size={20} color="#0284C7" />
            <Text style={styles.fabMenuText}>プレビュー表示</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.fabMenuItem, { borderBottomWidth: 0 }]} 
            onPress={() => { setIsOpen(false); onDelete(); }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.fabMenuText, { color: '#EF4444' }]}>データ削除</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.fabMainButton} onPress={() => setIsOpen(!isOpen)}>
        <Ionicons name={isOpen ? "close" : "build-outline"} size={20} color="#FFF" />
        <Text style={styles.fabMainText}>{isOpen ? "閉じる" : "ACTION"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrapper: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 30, right: 20, alignItems: 'flex-end', zIndex: 1000, elevation: 10 },
  fabMenu: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 5, paddingHorizontal: 15, marginBottom: 15, shadowColor: '#334155', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, width: 220 },
  fabMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  fabMenuText: { fontSize: 15, fontWeight: 'bold', marginLeft: 12, color: '#334155' },
  fabMainButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabMainText: { color: '#FFF', fontWeight: '900', fontSize: 15, marginLeft: 8, letterSpacing: 1 },
});