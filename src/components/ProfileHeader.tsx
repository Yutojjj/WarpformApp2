import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Person } from '../types';

interface Props {
  editedData: Person;
  onTakePhoto: (person: Person) => void;
}

const SERVER_URL = ' https://kisha-arthrodial-norene.ngrok-free.dev';

export default function ProfileHeader({ editedData, onTakePhoto }: Props) {
  const imageUrl = editedData["顔写真"] 
    ? `${SERVER_URL}/get_image?image_path=${encodeURIComponent(editedData["顔写真"])}`
    : null;

  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileTextContainer}>
        <Text style={styles.genjiName}>{editedData["源氏名"] || editedData["お名前"]}</Text>
        {editedData["源氏名"] ? <Text style={styles.realName}>本名: {editedData["お名前"]}</Text> : null}
        <Text style={styles.kanaName}>{editedData["かな"] || editedData["シート区分"]}</Text>
        <View style={[styles.statusBadge, { backgroundColor: editedData["ステータス"] === '審査中' ? '#fde68a' : '#94c7f0' }]}>
          <Text style={styles.statusBadgeText}>{editedData["ステータス"] || "未設定"}</Text>
        </View>
      </View>
      
      <View style={styles.photoFrame}>
        {imageUrl ? (
          <TouchableOpacity style={{ flex: 1 }} onPress={() => onTakePhoto(editedData)}>
            <Image source={{ uri: imageUrl }} style={styles.photo} resizeMode="cover" />
            <View style={styles.retakeBadge}><Text style={styles.retakeBadgeText}>↻ 再撮影</Text></View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cameraButton} onPress={() => onTakePhoto(editedData)}>
            <Ionicons name="camera" size={30} color="#94A3B8" />
            <Text style={styles.cameraButtonText}>撮影する</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 15 },
  profileTextContainer: { flex: 1, marginRight: 15 },
  genjiName: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  realName: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  kanaName: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginTop: 10, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  photoFrame: { width: 90, height: 120, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  cameraButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraButtonText: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  retakeBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  retakeBadgeText: { color: '#FFF', fontSize: 10 },
});