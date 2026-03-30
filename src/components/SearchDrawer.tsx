import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  onSearch: () => void;
  loading: boolean;
}

const screenWidth = Dimensions.get('window').width;

export default function SearchDrawer({
  visible,
  onClose,
  searchText,
  setSearchText,
  selectedTypes,
  setSelectedTypes,
  selectedStatuses,
  setSelectedStatuses,
  onSearch,
  loading
}: Props) {
  
  // ★追加：スライドアニメーションと背景のフェードアニメーション用の変数
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 開く時：右端から0の位置へスライド＆背景を暗くする
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
    } else {
      // 親の処理等で強制的に閉じられた場合のリセット
      slideAnim.setValue(screenWidth);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // ★追加：閉じる時のアニメーションを実行してから、本当に画面を閉じる
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: screenWidth, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
    ]).start(() => {
      onClose(); // アニメーション終了後に親へ通知
    });
  };

  // ★追加：検索ボタンを押した時も、アニメーションで閉じてから検索を実行
  const handleSearchPress = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: screenWidth, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
    ]).start(() => {
      onSearch(); 
    });
  };

  const toggleSelect = (list: string[], setList: (val: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // animationType="none" にして、アニメーションはすべて自前でコントロールします
  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleClose}>
      <View style={styles.drawerOverlay}>
        
        {/* 背景の暗くなる部分 */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
        </Animated.View>
        
        {/* 左側の空きスペース（ここを押しても閉じる） */}
        <View style={{ flex: 1 }} />
        
        {/* メニュー本体（右からスライドしてくる） */}
        <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>検索・絞り込み</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.section}>
                 <Text style={styles.sectionLabel}>キーワード</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="名前やキーワード..."
                  placeholderTextColor="#94A3B8"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>区分</Text>
                <View style={styles.categoryButtonGroup}>
                  {['キャスト', 'スタッフ'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.largeButton, selectedTypes.includes(type) && styles.largeButtonSelected]}
                      onPress={() => toggleSelect(selectedTypes, setSelectedTypes, type)}
                    >
                      <Text style={[styles.largeButtonText, selectedTypes.includes(type) && styles.buttonTextSelected]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>現在の状態</Text>
                <View style={styles.statusButtonGroup}>
                  {['審査中', '体験中', '在籍中', '退店済み','不採用'].map((status, index) => {
                    const isLastInRow = (index + 1) % 3 === 0;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.mediumButton,
                          selectedStatuses.includes(status) && styles.mediumButtonSelected,
                          !isLastInRow && { marginRight: '3.5%' }
                        ]}
                        onPress={() => toggleSelect(selectedStatuses, setSelectedStatuses, status)}
                      >
                        <Text style={[styles.mediumButtonText, selectedStatuses.includes(status) && styles.buttonTextSelected]}>{status}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 検索実行時もアニメーション処理を噛ませる */}
              <TouchableOpacity style={styles.searchSubmitButton} onPress={handleSearchPress}>
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.searchSubmitText}>絞り込む</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerContent: { width: '85%', backgroundColor: '#ffffff', height: '100%', paddingHorizontal: 20, paddingTop: 10, shadowColor: '#000', shadowOffset: { width: -5, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  drawerTitle: { fontSize: 18, fontWeight: '800', color: '#2c79d0' },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 13, fontWeight: '900', color: '#94A3B8', marginBottom: 15, letterSpacing: 1.5 },
  searchInput: { backgroundColor: '#F8FAFC', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 14, fontSize: 16, color: '#334155', borderWidth: 1, borderColor: '#E2E8F0' },
  categoryButtonGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  largeButton: { width: '48%', backgroundColor: '#F8FAFC', paddingVertical: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  largeButtonSelected: { backgroundColor: '#94c7f0', borderColor: '#94c7f0' },
  largeButtonText: { fontSize: 16, color: '#7994bb', fontWeight: '900' },
  statusButtonGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  mediumButton: { width: '31%', backgroundColor: '#F8FAFC', paddingVertical: 20, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  mediumButtonSelected: { backgroundColor: '#94c7f0', borderColor: '#94c7f0' },
  mediumButtonText: { fontSize: 14, color: '#7994bb', fontWeight: '800' },
  buttonTextSelected: { color: '#ffffff' },
  searchSubmitButton: { backgroundColor: '#56cf58', paddingVertical: 20, borderRadius: 16, alignItems: 'center', marginTop: 5, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  searchSubmitText: { color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: 2 },
});