import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  panHandlers: any;
  searchText: string;
  setSearchText: (t: string) => void;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  handleSearch: () => void;
  loading: boolean;
}

export default function SearchFilterDrawer({
  visible, onClose, fadeAnim, slideAnim, panHandlers,
  searchText, setSearchText, selectedTypes, setSelectedTypes,
  selectedStatuses, setSelectedStatuses, handleSearch, loading
}: Props) {
  
  const toggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    if (list.includes(val)) setList(list.filter(i => i !== val));
    else setList([...list, val]);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.drawerOverlay}>
        {/* 背景オーバーレイ */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)', opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        {/* ドロワー本体（右端に配置） */}
        <Animated.View 
          {...panHandlers} 
          style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle}>絞り込み</Text>
                <View style={styles.swipeHintLine} />
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>キーワード</Text>
                <TextInput 
                  style={styles.searchInput} 
                  placeholder="フリーワード検索..." 
                  placeholderTextColor="#444" 
                  value={searchText} 
                  onChangeText={setSearchText} 
                />
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>表示対象</Text>
                <View style={styles.row}>
                  {['キャスト', 'スタッフ'].map(t => (
                    <TouchableOpacity 
                      key={t} 
                      style={[styles.btnLarge, selectedTypes.includes(t) && styles.btnActive]} 
                      onPress={() => toggle(selectedTypes, setSelectedTypes, t)}
                    >
                      <Text style={[styles.btnTextLarge, selectedTypes.includes(t) && {color:'#000'}]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ステータス</Text>
                <View style={styles.statusWrap}>
                  {['審査中', '体験中', '在籍中', '退店済み','不採用'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.btnMedium, selectedStatuses.includes(s) && styles.btnActive]} 
                      onPress={() => toggle(selectedStatuses, setSelectedStatuses, s)}
                    >
                      <Text style={[styles.btnTextMedium, selectedStatuses.includes(s) && {color:'#000'}]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>検索を実行する</Text>}
              </TouchableOpacity>
              
              <View style={{ height: 100 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'flex-end' // ★メニューを右端に密着させる
  },
  drawerContent: { 
    width: '85%', 
    backgroundColor: '#0A0A0A', 
    height: '100%', 
    paddingHorizontal: 25, 
    borderLeftWidth: 1, 
    borderLeftColor: '#2C2C2E' 
  },
  drawerHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 30, 
    borderBottomWidth: 1, 
    borderBottomColor: '#2C2C2E' 
  },
  drawerTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#D4AF37', 
    letterSpacing: 5 
  },
  swipeHintLine: { 
    width: 30, 
    height: 3, 
    backgroundColor: '#D4AF37', 
    borderRadius: 2, 
    marginTop: 4, 
    opacity: 0.5 
  },
  section: { 
    marginBottom: 40 
  },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#D4AF37', 
    marginBottom: 18, 
    letterSpacing: 3, 
    opacity: 0.7 
  },
  searchInput: { 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 18, 
    paddingHorizontal: 20, 
    borderRadius: 15, 
    fontSize: 16, 
    color: '#FFF', 
    borderWidth: 1, 
    borderColor: '#2C2C2E' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  statusWrap: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start' 
  },
  // 表示対象ボタン（以前の縦に大きいサイズを復元）
  btnLarge: { 
    width: '48%', 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 45, // ★高さを大幅にアップ
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#2C2C2E' 
  },
  btnTextLarge: { 
    fontSize: 15, 
    color: '#8E8E93', 
    fontWeight: '800' 
  },
  // ステータスボタン（押しやすさを改善）
  btnMedium: { 
    width: '31%', 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 20, // ★高さをアップ
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#2C2C2E', 
    marginBottom: 12, 
    marginRight: '2%' 
  },
  btnTextMedium: { 
    fontSize: 13, 
    color: '#8E8E93', 
    fontWeight: '800' 
  },
  btnActive: { 
    backgroundColor: '#D4AF37', 
    borderColor: '#D4AF37' 
  },
  submitButton: { 
    backgroundColor: '#D4AF37', 
    paddingVertical: 22, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginTop: 15 
  },
  submitText: { 
    color: '#000', 
    fontSize: 16, 
    fontWeight: '900', 
    letterSpacing: 2 
  },
});