import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Person } from '../types';

interface Props { visible: boolean; onClose: () => void; data: Person | null; onPrint: () => void; imageSource: any; }

export const ResumePreview = ({ visible, onClose, data, onPrint, imageSource }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  if (!visible || !data) return null;

  const categories = [
    { id: 'Basic', title: '身体・基本情報', icon: 'person', color: '#8B5CF6', keywords: ['年齢', '生年月日', '血液型', '身長', '体重', 'カップ', 'B', 'W', 'H', '干支', '本籍地'] },
    { id: 'Contact', title: '連絡先・住所', icon: 'chatbubbles', color: '#10B981', keywords: ['携帯番号', 'LINE', 'Instagram', 'TikTok', 'X', 'Twitter', '緊急連絡先', '現住所', 'お住まい'] },
    { id: 'Work', title: '職歴・希望条件', icon: 'briefcase', color: '#F59E0B', keywords: ['面接日', '採用日', '退店日', '体験日', '担当名', '時給', '保証', '売上', '金額', '同伴', 'アフター', '理由', '週何回', '曜日', '時間', '動機', '条件', '職業', '会社名', '店名', '給与', '在籍', '水商売', '経験', '夜職', '職歴', 'レンタル'] },
    { id: 'Others', title: 'その他詳細', icon: 'star', color: '#EC4899', keywords: [] },
  ];

  const getKeys = (catId: string) => {
    const exclude = ["顔写真", "シート区分", "お名前", "源氏名", "ステータス", "かな", "送信日時", "証明書写真(表)", "証明書写真(裏)"];
    const allKeys = Object.keys(data).filter(k => !exclude.includes(k) && (data as any)[k]);
    if (catId === 'Others') {
      const used = categories.filter(c => c.id !== 'Others').flatMap(c => c.keywords);
      return allKeys.filter(k => !used.some(u => k.includes(u)));
    }
    const cat = categories.find(c => c.id === catId);
    return allKeys.filter(k => cat?.keywords.some(kw => k.includes(kw)));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}><Ionicons name="chevron-back" size={28} color="#FFF" /></TouchableOpacity>
            <Text style={styles.headerTitle}>デジタル履歴書</Text>
            <TouchableOpacity onPress={onPrint}><Ionicons name="print" size={24} color="#D4AF37" /></TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.profileTop}>
              <View style={styles.photoRing}>{imageSource ? <Image source={imageSource} style={styles.photo} /> : <Ionicons name="person" size={60} color="#555" />}</View>
              <Text style={styles.mainName}>{data["源氏名"] || data["お名前"]}</Text>
              <View style={styles.statusBadge}><Text style={styles.statusText}>{data["ステータス"]}</Text></View>
            </View>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity key={cat.id} style={styles.catCard} onPress={() => setSelectedCategory(cat.id)}>
                  <View style={[styles.iconBg, { backgroundColor: cat.color + '33' }]}><Ionicons name={cat.icon as any} size={24} color={cat.color} /></View>
                  <Text style={styles.catTitle}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
        {selectedCategory && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupCard}>
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>{categories.find(c=>c.id===selectedCategory)?.title}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}><Ionicons name="close-circle" size={30} color="#D4AF37" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.popupScroll}>
                {getKeys(selectedCategory).map(key => (
                  <View key={key} style={[styles.tile, String((data as any)[key]).length > 12 ? styles.full : styles.half]}>
                    <Text style={styles.tileLabel}>{key}</Text>
                    <Text style={styles.tileVal}>{String((data as any)[key])}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0B1120' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  profileTop: { alignItems: 'center', marginVertical: 20 },
  photoRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#8B5CF6', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  photo: { width: '100%', height: '100%' },
  mainName: { fontSize: 30, fontWeight: 'bold', color: '#FFF', marginTop: 10 },
  statusBadge: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 15 },
  catCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 20, padding: 25, marginBottom: 15, alignItems: 'center' },
  iconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  catTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  popupOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  popupCard: { width: '92%', maxHeight: '82%', backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#D4AF37' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 10 },
  popupTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  popupScroll: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 10 },
  half: { width: '48%' },
  full: { width: '100%' },
  tileLabel: { color: '#94A3B8', fontSize: 10, marginBottom: 4 },
  tileVal: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});