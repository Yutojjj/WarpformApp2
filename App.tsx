import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// src/screens フォルダにある配属管理画面を読み込む
import AssignmentSearchScreen from './src/screens/AssignmentSearchScreen';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  base: '#0A0A0A',
  surface: '#1A1A1A',
  accent: '#D4AF37', // ゴールド
  accentLight: '#F3E5AB', // ライトゴールド（輝き用）
  formAccent: '#10B981', 
  textPrimary: '#E5E5EA', 
  textSecondary: '#636366',
  border: '#1C1C1E',
  borderLight: '#2C2C2E',
  overlay: 'rgba(0,0,0,0.95)',
};

const STAFF_FORM_URL = 'https://interview-form-red.vercel.app/';
const CAST_FORM_URL = 'https://interviw-form-w.vercel.app/';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'assignment'>('menu');
  const [testMenuVisible, setTestMenuVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [targetQr, setTargetQr] = useState<{title: string, url: string} | null>(null);

  const screenAnim = useRef(new Animated.Value(0)).current; 
  const testScaleAnim = useRef(new Animated.Value(0.9)).current;
  const testFadeAnim = useRef(new Animated.Value(0)).current;

  // 配属管理画面を開く
  const openAssignment = () => {
    if (isTransitioning || currentScreen === 'assignment') return;
    setIsTransitioning(true);
    setCurrentScreen('assignment');
    screenAnim.setValue(0);
    Animated.spring(screenAnim, { 
      toValue: 1, 
      tension: 45, 
      friction: 9, 
      useNativeDriver: true 
    }).start(() => setIsTransitioning(false));
  };

  // メニューに戻る
  const closeAssignment = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    Animated.timing(screenAnim, { 
      toValue: 0, 
      duration: 300, 
      useNativeDriver: true 
    }).start(() => {
      setCurrentScreen('menu');
      setIsTransitioning(false);
    });
  };

  // フォームメニューを開く
  const openTestMenu = () => {
    if (isTransitioning) return;
    setTestMenuVisible(true);
    Animated.parallel([
      Animated.spring(testScaleAnim, { 
        toValue: 1, 
        tension: 50, 
        friction: 7, 
        useNativeDriver: true 
      }),
      Animated.timing(testFadeAnim, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: true 
      })
    ]).start();
  };

  // フォームメニューを閉じる
  const closeTestMenu = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(testScaleAnim, { 
        toValue: 0.9, 
        duration: 150, 
        useNativeDriver: true 
      }),
      Animated.timing(testFadeAnim, { 
        toValue: 0, 
        duration: 150, 
        useNativeDriver: true 
      })
    ]).start(() => {
      setTestMenuVisible(false);
      setIsTransitioning(false);
    });
  };

  const showQR = (title: string, url: string) => {
    setTargetQr({ title, url });
    setQrModalVisible(true);
  };

  const handleOpenURL = (url: string) => {
    Linking.openURL(url);
    closeTestMenu();
  };

  const menuStyle = {
    transform: [
      { translateX: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -screenWidth * 0.25] }) },
      { scale: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) }
    ],
    opacity: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] })
  };

  const assignmentStyle = {
    transform: [{ translateX: screenAnim.interpolate({ inputRange: [0, 1], outputRange: [screenWidth, 0] }) }],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.menuRoot, menuStyle]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* ヘッダー：筆記体風ゴールド */}
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>WARP MANAGEMENT SYSTEM</Text>
            
            <View style={styles.headerMainContainer}>
              <Text style={[styles.headerMainTitle, styles.headerMainTitleShadow]}>Warp Nexus</Text>
              <Text style={styles.headerMainTitle}>Warp Nexus</Text>
            </View>

            <View style={styles.headerLineContainer}>
              <View style={styles.headerLineLeft} />
              <Ionicons name="star" size={8} color={COLORS.accent} style={{ marginHorizontal: 10 }} />
              <View style={styles.headerLineRight} />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.menuContent}>
            {/* 1. 配属管理ボタン */}
            <TouchableOpacity style={styles.menuButton} onPress={openAssignment} activeOpacity={0.7} disabled={isTransitioning}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                <Ionicons name="people-outline" size={26} color={COLORS.accent} />
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={[styles.buttonMainText, { color: COLORS.accent }]}>配属管理</Text>
                <Text style={[styles.buttonSubText, { color: '#B59410' }]}>STAFF & CAST SEARCH</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.borderLight} />
            </TouchableOpacity>

            {/* 2. 面接フォームボタン */}
            <TouchableOpacity style={styles.menuButton} onPress={openTestMenu} activeOpacity={0.7} disabled={isTransitioning}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                <Ionicons name="document-text-outline" size={26} color={COLORS.formAccent} />
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={[styles.buttonMainText, { color: COLORS.formAccent }]}>面接フォーム</Text>
                <Text style={[styles.buttonSubText, { color: '#059669' }]}>ENTRY FORM & QR TOOLS</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.borderLight} />
            </TouchableOpacity>

            {/* 開発中ボタン */}
            <View style={styles.disabledButton}>
              <View style={styles.iconWrapperDisabled}>
                <Ionicons name="calendar-outline" size={26} color={COLORS.borderLight} />
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={styles.buttonMainTextDisabled}>出勤管理(開発中)</Text>
                <Text style={styles.buttonSubTextDisabled}>COMING SOON</Text>
              </View>
            </View>

            <View style={styles.disabledButton}>
              <View style={styles.iconWrapperDisabled}>
                <Ionicons name="analytics-outline" size={26} color={COLORS.borderLight} />
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={styles.buttonMainTextDisabled}>売上分析(開発中)</Text>
                <Text style={styles.buttonSubTextDisabled}>COMING SOON</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.versionText}>EXCLUSIVELY DESIGNED BY SYADO</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {/* 配属管理画面 */}
      {currentScreen === 'assignment' && (
        <Animated.View style={[styles.assignmentWrapper, assignmentStyle]}>
          <View style={styles.sideShadow} />
          <AssignmentSearchScreen onBack={closeAssignment} menuBg="#0A0A0A" swipeAnim={screenAnim} />
        </Animated.View>
      )}


      {/* フォーム選択モーダル＆QRコード表示（iOSフリーズ対策済） */}
      <Modal visible={testMenuVisible} transparent={true} animationType="none" onRequestClose={closeTestMenu}>
        
        {/* メニュー本体 */}
        <Animated.View style={[styles.modalOverlay, { opacity: testFadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeTestMenu} />
          <Animated.View style={[styles.modalContent, { transform: [{ scale: testScaleAnim }] }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="document-text-outline" size={22} color={COLORS.formAccent} />
              <Text style={[styles.modalHeaderTitle, { color: COLORS.formAccent }]}>面接フォーム</Text>
              <TouchableOpacity onPress={closeTestMenu} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.testItemContainer}>
                <TouchableOpacity style={styles.modalActionButton} onPress={() => handleOpenURL(STAFF_FORM_URL)} activeOpacity={0.8}>
                  <View style={[styles.modalIconCircle, {borderColor: '#38BDF8'}]}>
                    <Ionicons name="man-outline" size={24} color="#38BDF8" />
                  </View>
                  <View style={styles.modalActionTextWrapper}>
                    <Text style={styles.modalActionMain}>スタッフ入力</Text>
                    <Text style={styles.modalActionSub}>OPEN FORM</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.qrSmallButton} onPress={() => showQR("スタッフ用フォーム", STAFF_FORM_URL)}>
                  <Ionicons name="qr-code" size={22} color={COLORS.accent} />
                </TouchableOpacity>
              </View>

              <View style={styles.testItemContainer}>
                <TouchableOpacity style={styles.modalActionButton} onPress={() => handleOpenURL(CAST_FORM_URL)} activeOpacity={0.8}>
                  <View style={[styles.modalIconCircle, {borderColor: '#FB7185'}]}>
                    <Ionicons name="woman-outline" size={24} color="#FB7185" />
                  </View>
                  <View style={styles.modalActionTextWrapper}>
                    <Text style={styles.modalActionMain}>キャスト入力</Text>
                    <Text style={styles.modalActionSub}>OPEN FORM</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.qrSmallButton} onPress={() => showQR("キャスト用フォーム", CAST_FORM_URL)}>
                  <Ionicons name="qr-code" size={22} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ★ QRコードオーバーレイ（iOS対策：別のModalを開かず、同じModal内の最前面に表示する） */}
        {qrModalVisible && (
          <View style={[StyleSheet.absoluteFill, styles.qrOverlay, { zIndex: 1000 }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setQrModalVisible(false)} />
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>{targetQr?.title}</Text>
              <View style={styles.qrImageFrame}>
                {targetQr && (
                  <Image 
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetQr.url)}` }} 
                    style={styles.qrImage}
                  />
                )}
              </View>
              <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setQrModalVisible(false)}>
                <Text style={styles.qrCloseBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  menuRoot: { flex: 1, backgroundColor: COLORS.base },
  header: { paddingTop: 60, paddingBottom: 25, alignItems: 'center' },
  headerSubtitle: { fontSize: 8, color: COLORS.textSecondary, letterSpacing: 6, fontWeight: '700', marginBottom: 5 },
  headerMainContainer: { position: 'relative', height: 60, justifyContent: 'center', alignItems: 'center' },
  headerMainTitle: {
    fontSize: 42,
    color: COLORS.accent,
    fontStyle: 'italic',
    fontWeight: '300',
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  headerMainTitleShadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    color: COLORS.accentLight,
    opacity: 0.3,
  },
  headerLineContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, width: screenWidth * 0.7 },
  headerLineLeft: { flex: 1, height: 0.5, backgroundColor: COLORS.accent, opacity: 0.3 },
  headerLineRight: { flex: 1, height: 0.5, backgroundColor: COLORS.accent, opacity: 0.3 },
  menuContent: { paddingHorizontal: 25, paddingTop: 15 },
  menuButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: 20, paddingHorizontal: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  iconWrapper: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 18 },
  buttonTextWrapper: { flex: 1 },
  buttonMainText: { fontSize: 19, fontWeight: '900', marginBottom: 2 },
  buttonSubText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  disabledButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, opacity: 0.25 },
  iconWrapperDisabled: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 18 },
  buttonMainTextDisabled: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  buttonSubTextDisabled: { fontSize: 9, color: '#222', letterSpacing: 1 },
  footer: { marginTop: 60, alignItems: 'center', paddingBottom: 40 },
  versionText: { fontSize: 8, color: '#333', letterSpacing: 2, fontWeight: 'bold' },
  assignmentWrapper: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  sideShadow: { position: 'absolute', left: -15, top: 0, bottom: 0, width: 15, backgroundColor: 'rgba(0,0,0,0.5)', shadowColor: '#000', shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, zIndex: 99 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.overlay },
  modalContent: { width: screenWidth * 0.85, backgroundColor: COLORS.surface, borderRadius: 32, borderWidth: 1, borderColor: COLORS.borderLight, overflow: 'hidden', elevation: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.02)' },
  modalHeaderTitle: { flex: 1, fontSize: 12, fontWeight: '900', letterSpacing: 3, marginLeft: 10 },
  modalCloseButton: { padding: 4 },
  modalBody: { padding: 24 },
  testItemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  modalActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.base, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  qrSmallButton: { width: 56, height: 56, backgroundColor: COLORS.surface, borderRadius: 20, marginLeft: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.accent + '44' },
  modalIconCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14, backgroundColor: 'rgba(255,255,255,0.02)' },
  modalActionTextWrapper: { flex: 1 },
  modalActionMain: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  modalActionSub: { fontSize: 9, color: COLORS.textSecondary },
  qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  qrContainer: { width: screenWidth * 0.8, backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center' },
  qrTitle: { fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 20 },
  qrImageFrame: { padding: 10, backgroundColor: '#FFF', borderRadius: 10 },
  qrImage: { width: 220, height: 220 },
  qrCloseBtn: { marginTop: 25, backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  qrCloseBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});