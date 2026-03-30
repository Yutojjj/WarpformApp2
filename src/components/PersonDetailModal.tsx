import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import PersonDetailForm from './PersonDetailForm';

import { Person } from '../types';
import { generatePDF, getHtmlForPreview } from '../utils/pdfGenerator';
import { COLORS, styles } from './PersonDetailModalStyles';

interface Props {
  visible: boolean;
  person: Person | null;
  initialEditState?: boolean;
  initialPreviewState?: boolean; 
  onClose: () => void;
  onTakePhoto: (person: Person, field?: string) => void; 
  onUpdate?: (updatedPerson: Person | null) => void;
}

export default function PersonDetailModal({ 
  visible, 
  person, 
  initialEditState = false, 
  onClose, 
  onTakePhoto, 
  onUpdate 
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Person | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [activeEditCategory, setActiveEditCategory] = useState<any | null>(null);
  
  const [pdfHtmlStr, setPdfHtmlStr] = useState<string>('');

  const panY = useRef(new Animated.Value(0)).current;
  const SERVER_URL = 'https://kisha-arthrodial-norene.ngrok-free.dev';

  useEffect(() => {
    if (person && visible) {
      setEditedData({ ...person });
      setIsEditing(initialEditState);
      setIsPhotoMenuOpen(false);
      setActiveEditCategory(null);
      panY.setValue(0);
      
      getHtmlForPreview(person).then(html => setPdfHtmlStr(html));
    } else {
      setEditedData(null);
      setPdfHtmlStr('');
    }
  }, [person, visible, initialEditState]);

  const handleCall = (phone?: string) => {
    if (!phone) return Alert.alert("エラー", "番号が登録されていません");
    Linking.openURL(`tel:${phone}`);
  };

  const handleSMS = (phone?: string) => {
    if (!phone) return Alert.alert("エラー", "番号が登録されていません");
    Linking.openURL(`sms:${phone}`);
  };

  const handleOpenMap = (address?: string) => {
    if (!address) return Alert.alert("エラー", "住所が登録されていません");
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({ ios: `maps://app?q=${encodedAddress}`, android: `geo:0,0?q=${encodedAddress}` });
    if (url) Linking.openURL(url);
  };

  const handleInputChange = useCallback((key: string, value: string) => {
    setEditedData((prev: any) => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  }, []);

  const handleSave = async () => {
    if (!editedData) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${SERVER_URL}/update_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(editedData),
      });
      const json = await response.json();
      if (json.status === 'success') {
        Alert.alert('完了', '情報を更新しました');
        setIsEditing(false);
        const updatedHtml = await getHtmlForPreview(editedData);
        setPdfHtmlStr(updatedHtml);
        if (onUpdate) onUpdate(editedData);
      }
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editedData) return;
    Alert.alert("削除の確認", `${(editedData as any)["お名前"]} さんのデータを完全に削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      { text: "削除する", style: "destructive", onPress: async () => {
          setIsSaving(true);
          try {
            const response = await fetch(`${SERVER_URL}/delete_data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
              body: JSON.stringify({ "お名前": (editedData as any)["お名前"], "シート区分": (editedData as any)["シート区分"] }),
            });
            const json = await response.json();
            if (json.status === 'success') {
              Alert.alert('完了', 'データを削除しました');
              onClose();
              if (onUpdate) onUpdate(null);
            }
          } catch (error) { Alert.alert('エラー', '削除に失敗しました'); } finally { setIsSaving(false); }
      }}
    ]);
  };

  const handlePrintPdf = async () => {
    if (!editedData) return;
    try { 
      await generatePDF(editedData); 
    } catch (error) { 
      Alert.alert("エラー", "印刷に失敗しました"); 
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => { if (gs.dy > 0) panY.setValue(gs.dy); },
      onPanResponderRelease: (_, gs) => {
        const screenHeight = Platform.OS === 'ios' ? 800 : 900; 
        if (gs.dy > 120 || gs.vy > 0.8) { Animated.timing(panY, { toValue: screenHeight, duration: 250, useNativeDriver: true }).start(() => onClose()); }
        else { Animated.spring(panY, { toValue: 0, friction: 8, useNativeDriver: true }).start(); }
      },
    })
  ).current;

  const handlePhotoAction = (field: string) => {
    setIsPhotoMenuOpen(false);
    onTakePhoto(editedData!, field);
  };

  if (!visible || !editedData) return null;

  const getImageSource = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('file://')) return { uri: path };
    if (path.startsWith('http')) return { uri: path, headers: { 'ngrok-skip-browser-warning': 'true' } };
    return { uri: `${SERVER_URL}/get_image?image_path=${encodeURIComponent(path)}`, headers: { 'ngrok-skip-browser-warning': 'true' } };
  };

  const imageSource = (person as any).previewImageBase64 ? { uri: (person as any).previewImageBase64 } : getImageSource((editedData as any)["顔写真"]);

  const isCast = editedData["シート区分"] === "キャスト";
  const themeColor = isCast ? "#D81B60" : "#0F284F"; 
  const pdfTheme = isCast ? {
    bg: "#FCE4EC",     
    border: "#F48FB1", 
    text: "#D81B60",   
  } : {
    bg: "#E0F2FE",     
    border: "#93C5FD", 
    text: "#0F284F",   
  };

  const DYNAMIC_CATEGORIES = isCast ? [
    { id: 'photo', title: '写真・身分証', icon: 'camera', color: '#A855F7' },
    { id: 'admin', title: '管理情報', icon: 'settings', color: '#64748B' },
    { id: 'basic', title: '基本情報', icon: 'person', color: '#3B82F6' },
    { id: 'salary', title: '勤務条件', icon: 'cash', color: '#F59E0B' },
    { id: 'contact', title: 'SNS・連絡先', icon: 'chatbubbles', color: '#10B981' },
    { id: 'body', title: '身体・経験', icon: 'body', color: '#EC4899' },
    { id: 'history', title: '職歴', icon: 'briefcase', color: '#8B5CF6' }
  ] : [
    { id: 'photo', title: '写真・身分証', icon: 'camera', color: '#A855F7' },
    { id: 'admin', title: '管理情報', icon: 'settings', color: '#64748B' },
    { id: 'basic', title: '基本情報', icon: 'person', color: '#3B82F6' },
    { id: 'contact', title: '連絡先・条件', icon: 'chatbubbles', color: '#10B981' },
    { id: 'job', title: 'パーソナル・経歴', icon: 'body', color: '#EC4899' },
    { id: 'history', title: '職歴', icon: 'briefcase', color: '#8B5CF6' }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <Animated.View style={[{ flex: 1, backgroundColor: '#FFFFFF' }, { transform: [{ translateY: panY }] }]}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <StatusBar barStyle="dark-content" />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            
            <View style={[styles.modalHeader, { backgroundColor: '#FFFFFF', borderBottomColor: '#EEE', borderBottomWidth: 1 }]} {...panResponder.panHandlers}>
              <TouchableOpacity onPress={onClose} style={styles.headerSideButton}><Text style={[styles.closeButtonText, {color: '#333'}]}>閉じる</Text></TouchableOpacity>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={[styles.swipeIndicator, {backgroundColor: '#CCC'}]} />
                <Text style={[styles.modalTitle, {color: '#333'}]}>履歴書データ</Text>
              </View>
              <View style={styles.headerSideButton}>
                <TouchableOpacity onPress={handlePrintPdf} style={{ alignItems: 'flex-end' }}>
                  <Ionicons name="print" size={24} color={themeColor} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: '#EFEFEF' }}>
              {pdfHtmlStr === '' ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={themeColor} />
                  <Text style={{ color: '#666', marginTop: 10 }}>PDFを生成中...</Text>
                </View>
              ) : (
                <>
                  <WebView 
                    originWhitelist={['*']}
                    source={{ html: pdfHtmlStr }}
                    style={{ flex: 1, backgroundColor: '#FFFFFF' }}
                    scalesPageToFit={true}
                    showsVerticalScrollIndicator={true}
                    showsHorizontalScrollIndicator={true}
                    bounces={false}
                    onMessage={(event) => {
                      const actionId = event.nativeEvent.data;
                      const targetCategory = DYNAMIC_CATEGORIES.find(c => c.id === actionId);
                      if (targetCategory) {
                        setActiveEditCategory(targetCategory);
                      }
                    }}
                  />

                  {/* ★変更：アクションボタンを左下に配置 */}
                  {((editedData as any)["携帯番号"] || (editedData as any)["現住所"]) && (
                    <View style={stylesPhoto.bottomLeftFabContainer}>
                      {(editedData as any)["現住所"] && (
                        <TouchableOpacity style={stylesPhoto.actionFab} onPress={() => handleOpenMap((editedData as any)["現住所"])}>
                          <Ionicons name="location-sharp" size={18} color="#EA4335" />
                          <Text style={stylesPhoto.actionText}>MAP</Text>
                        </TouchableOpacity>
                      )}
                      {(editedData as any)["携帯番号"] && (
                        <>
                          <TouchableOpacity style={stylesPhoto.actionFab} onPress={() => handleSMS((editedData as any)["携帯番号"])}>
                            <Ionicons name="chatbubble" size={18} color={COLORS.accent} />
                            <Text style={stylesPhoto.actionText}>SMS</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={stylesPhoto.actionFab} onPress={() => handleCall((editedData as any)["携帯番号"])}>
                            <Ionicons name="call" size={18} color={COLORS.actionBlue} />
                            <Text style={stylesPhoto.actionText}>電話</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}

                  {/* 右下のメインカメラボタン */}
                  <View style={stylesPhoto.fabContainer}>
                    <TouchableOpacity
                      style={[stylesPhoto.mainFab, { backgroundColor: themeColor }]}
                      onPress={() => setIsPhotoMenuOpen(true)}
                    >
                      <Ionicons name="camera" size={28} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <View style={{ height: 80, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#EEEEEE', flexDirection: 'row', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 15 : 0 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 15, alignItems: 'center' }}>
                {DYNAMIC_CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.id} onPress={() => setActiveEditCategory(cat)} style={{ alignItems: 'center', marginRight: 20, width: 60 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: cat.color + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 1, borderColor: cat.color + '40' }}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <Text style={{ color: '#333', fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{cat.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={{ paddingHorizontal: 15, borderLeftWidth: 1, borderColor: '#EEEEEE', height: '100%', justifyContent: 'center' }}>
                <TouchableOpacity onPress={handleDelete} style={{ alignItems: 'center' }}>
                  <Ionicons name="trash" size={24} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 10, marginTop: 4 }}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isPhotoMenuOpen && (
              <Modal visible={isPhotoMenuOpen} transparent animationType="fade">
                <TouchableOpacity style={stylesPhoto.overlay} activeOpacity={1} onPress={() => setIsPhotoMenuOpen(false)}>
                  <Animated.View style={[stylesPhoto.menu, { borderColor: themeColor }]}>
                    <View style={[stylesPhoto.header, { backgroundColor: pdfTheme.bg, borderBottomColor: pdfTheme.border }]}>
                      <Text style={[stylesPhoto.title, { color: pdfTheme.text }]}>写真の撮影</Text>
                      <TouchableOpacity onPress={() => setIsPhotoMenuOpen(false)}><Ionicons name="close-circle" size={24} color={pdfTheme.border} /></TouchableOpacity>
                    </View>
                    
                    {[
                      { label: '顔写真を撮影', field: '顔写真', icon: 'person' },
                      { label: '身分証明書(表)を撮影', field: '証明書写真(表)', icon: 'card' },
                      { label: '身分証明書(裏)を撮影', field: '証明書写真(裏)', icon: 'card' }
                    ].map(item => (
                      <TouchableOpacity key={item.field} style={stylesPhoto.item} onPress={() => handlePhotoAction(item.field)}>
                        <View style={[stylesPhoto.iconBg, { backgroundColor: pdfTheme.bg }]}><Ionicons name={item.icon as any} size={20} color={pdfTheme.text} /></View>
                        <Text style={stylesPhoto.itemLabel}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#CCC" />
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
            )}

            {activeEditCategory && (
              <View style={[styles.detailPopupOverlay, { zIndex: 999, backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Animated.View style={[styles.detailPopupCard, { maxHeight: '85%', paddingBottom: 30, backgroundColor: '#FFFFFF', borderColor: pdfTheme.border, borderWidth: 2 }]}>
                  <View style={[styles.detailPopupHeader, { backgroundColor: pdfTheme.bg, margin: -20, marginBottom: 15, padding: 20, borderBottomWidth: 1, borderBottomColor: pdfTheme.border, borderTopLeftRadius: 18, borderTopRightRadius: 18 }]}>
                    <Text style={[styles.detailPopupTitle, { color: '#333', fontWeight: 'bold' }]}>{activeEditCategory.title} の編集</Text>
                    <TouchableOpacity onPress={() => setActiveEditCategory(null)}>
                      <Ionicons name="close-circle" size={30} color={pdfTheme.border} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 5 }}>
                    {activeEditCategory.id === 'photo' ? (
                      <View>
                        <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>顔写真の変更</Text>
                        <View style={{ alignItems: 'center', marginBottom: 30 }}>
                          <View style={{ width: 120, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: pdfTheme.bg, borderWidth: 1, borderColor: pdfTheme.border }}>
                            {imageSource ? (
                              <TouchableOpacity style={{ flex: 1 }} onPress={() => onTakePhoto(editedData!, "顔写真")}>
                                <Image source={imageSource} style={styles.photo} resizeMode="cover" />
                                <View style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: pdfTheme.border, borderRadius: 12, padding: 6 }}><Ionicons name="camera" size={18} color="#FFF" /></View>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => onTakePhoto(editedData!, "顔写真")}>
                                <Ionicons name="camera" size={40} color={pdfTheme.border} /><Text style={{ color: '#333', fontSize: 12, marginTop: 5 }}>タップして追加</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>本人確認書類</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
                          {["証明書写真(表)", "証明書写真(裏)"].map((field) => {
                            const idSource = getImageSource((editedData as any)[field]);
                            return (
                              <View key={field} style={{ alignItems: 'center', width: '45%' }}>
                                <Text style={{ color: '#333', fontSize: 12, marginBottom: 5, fontWeight: 'bold' }}>{field.includes("(表)") ? "表面" : "裏面"}</Text>
                                <TouchableOpacity 
                                  style={{ width: '100%', height: 100, backgroundColor: pdfTheme.bg, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: pdfTheme.border, justifyContent: 'center', alignItems: 'center' }}
                                  onPress={() => onTakePhoto(editedData!, field)}
                                >
                                  {idSource ? <Image source={idSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Ionicons name="card-outline" size={30} color={pdfTheme.border} />}
                                  <View style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: pdfTheme.border, borderRadius: 12, padding: 4 }}><Ionicons name="camera" size={16} color="#FFF" /></View>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ) : (
                      <PersonDetailForm 
                        editedData={editedData} 
                        isEditing={true} 
                        onChange={handleInputChange} 
                        activeSection={activeEditCategory.id as any}
                        pdfTheme={pdfTheme} 
                      />
                    )}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                    <TouchableOpacity style={[styles.fabMainButton, { backgroundColor: pdfTheme.bg, borderColor: pdfTheme.border, borderWidth: 1, paddingHorizontal: 40, width: '100%', justifyContent: 'center', borderRadius: 25, paddingVertical: 14 }]} onPress={async () => { await handleSave(); setActiveEditCategory(null); }}>
                      {isSaving ? <ActivityIndicator size="small" color="#333" /> : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="checkmark-circle" size={22} color="#333" style={{ marginRight: 8 }} />
                          <Text style={[styles.fabMainText, { color: "#333", fontSize: 16, fontWeight: 'bold' }]}>保存して閉じる</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>
            )}

          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const stylesPhoto = StyleSheet.create({
  // ★変更：左下のアクションボタン用のコンテナ
  bottomLeftFabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  // 左下の各アクションボタンのデザイン
  actionFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  actionText: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  mainFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', 
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 100 : 90, 
  },
  menu: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});