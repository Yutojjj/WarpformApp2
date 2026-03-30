import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  InteractionManager,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView, // ← 追加
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from 'react-native';
import { DateFilterModal, SortModal } from '../components/DateSortModals';
import PersonCard from '../components/PersonCard';
import PersonDetailModal from '../components/PersonDetailModal';
import { Person } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

const initialScreenWidth = Dimensions.get('window').width;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0);

// ─────────────────────────────────────────────────────────
// カラーパレット定義
// ─────────────────────────────────────────────────────────

export type ColorPalette = typeof DARK_COLORS;

export const DARK_COLORS = {
  base:          '#0D1117',
  surface:       '#161B22',
  surface2:      '#1C2330',
  primary:       '#C9A84C',
  primaryLight:  'rgba(201,168,76,0.12)',
  primaryBorder: 'rgba(201,168,76,0.25)',
  primaryText:   '#0D1117',
  textPrimary:   '#F0F6FC',
  textSecondary: '#8B949E',
  textTertiary:  '#484F58',
  border:        'rgba(255,255,255,0.07)',
  borderMid:     'rgba(255,255,255,0.13)',
  castBg:        'rgba(244,143,177,0.10)',
  castBorder:    'rgba(244,143,177,0.28)',
  castText:      '#F48FB1',
  staffBg:       'rgba(147,197,253,0.10)',
  staffBorder:   'rgba(147,197,253,0.28)',
  staffText:     '#93C5FD',
  mapPin:        '#FF6B6B',
  danger:        '#FF6B6B',
  statusAmber:   '#F59E0B',
};

export const LIGHT_COLORS: ColorPalette = {
  base:          '#F5F3EE',
  surface:       '#FFFFFF',
  surface2:      '#EDE9E3',
  primary:       '#9B7B2E',
  primaryLight:  'rgba(155,123,46,0.08)',
  primaryBorder: 'rgba(155,123,46,0.22)',
  primaryText:   '#FFFFFF',
  textPrimary:   '#1A1612',
  textSecondary: '#6B6459',
  textTertiary:  '#B0A898',
  border:        'rgba(0,0,0,0.07)',
  borderMid:     'rgba(0,0,0,0.13)',
  castBg:        'rgba(244,143,177,0.12)',
  castBorder:    'rgba(244,143,177,0.35)',
  castText:      '#F48FB1',
  staffBg:       'rgba(147,197,253,0.12)',
  staffBorder:   'rgba(147,197,253,0.35)',
  staffText:     '#93C5FD',
  mapPin:        '#DC2626',
  danger:        '#DC2626',
  statusAmber:   '#D97706',
};

// ─────────────────────────────────────────────────────────
// 動的スタイル生成
// ─────────────────────────────────────────────────────────

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  backgroundRoot: { flex: 1 },
  container:      { flex: 1, backgroundColor: c.base },
  statusBarPadding: { height: STATUS_BAR_HEIGHT },

  headerWrapper: {
    backgroundColor: c.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
    zIndex: 10,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerBackBtn: {
    position: 'absolute',
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: c.surface2,
    borderWidth: 0.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: c.textPrimary,
    letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '700',
    color: c.primary,
    letterSpacing: 3,
    marginTop: 1,
  },
  headerRightGroup: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: c.primaryLight,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  listItemContainer: {
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  leftInfoGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText:  { fontSize: 13, color: c.textSecondary, fontWeight: '600' },
  countNum:   { color: c.primary, fontWeight: '800', fontSize: 15 },
  periodSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: c.surface2,
    borderRadius: 8,
    padding: 2,
    borderWidth: 0.5,
    borderColor: c.border,
  },
  periodBtn: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  periodBtnActive: {
    backgroundColor: c.primary,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  periodBtnText:       { fontSize: 11, color: c.textSecondary, fontWeight: '700' },
  periodBtnTextActive: { color: c.primaryText, fontWeight: '800' },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    backgroundColor: c.primaryLight,
    gap: 4,
  },
  btnLabel: { fontSize: 11, fontWeight: '700', color: c.primary },

  searchBarContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: c.surface2,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  searchInput: {
    backgroundColor: c.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: c.textPrimary,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    fontSize: 13,
  },

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.primaryLight,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
  },
  filterBarText: { color: c.primary, fontSize: 12, fontWeight: '700' },

  stickyHeaderContainer: {
    backgroundColor: c.base + 'F0',
    paddingVertical: 8,
    width: '100%',
  },
  fancyDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  fancyDateLine: { flex: 1, height: 0.5, backgroundColor: c.primaryBorder },
  fancyDateCapsule: {
    backgroundColor: c.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: c.primaryBorder,
    marginHorizontal: 10,
  },
  fancyDateText: { color: c.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },

  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 9,
    justifyContent: 'flex-start',
    maxWidth: 1000,
    alignSelf: 'center',
  },

  loadingPlaceholder: { paddingVertical: 100, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyButton: {
    paddingVertical: 80,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: c.primaryBorder,
    borderRadius: 20,
    backgroundColor: c.surface,
    marginTop: 20,
    gap: 12,
  },
  placeholderText: { color: c.textSecondary, fontSize: 13, fontWeight: '600' },

  // スクロール式のタブバーに変更
  bottomTabBarWrapper: {
    backgroundColor: c.surface,
    borderTopWidth: 0.5,
    borderTopColor: c.border,
    paddingBottom: Platform.OS === 'ios' ? 32 : 48,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  bottomTabBarInner: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10, // タブ同士の間隔
  },
  tabBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20, // 幅を十分に持たせて文字切れを防ぐ
    borderRadius: 8,
    backgroundColor: c.surface2,
    borderWidth: 0.5,
    borderColor: c.border,
  },
  tabBtnActive: {
    backgroundColor: c.primary,
    borderColor: c.primaryBorder,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  tabBtnText:       { color: c.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  tabBtnTextActive: { color: c.primaryText, fontWeight: '800' },
});

// ─────────────────────────────────────────────────────────
// 型
// ─────────────────────────────────────────────────────────

type DisplayMode = 'list' | 'large' | 'grid' | 'extraLarge';
type SortType = 'interview_new' | 'interview_old' | 'age_asc' | 'age_desc' | 'default';
type TabType = '面接' | '審査中' | '体験' | '不採用' | '在籍' | '退店';
type TypeFilter = 'すべて' | 'キャスト' | 'スタッフ';
type PeriodType = 'all' | '1month' | '1week'; // ← 'all'（すべて）を追加

interface Props {
  onBack: () => void;
  menuBg: string;
  swipeAnim?: Animated.Value;
}

interface DateFilter {
  targetField: string | null;
  year: string | null;
  month: string | null;
  week: string | null;
}

interface PersonSection {
  title: string;
  data: any[];
}

// ─────────────────────────────────────────────────────────
// コンポーネント
// ─────────────────────────────────────────────────────────

export default function AssignmentSearchScreen({ onBack, menuBg, swipeAnim }: Props) {
  const { width: currentScreenWidth } = useWindowDimensions();
  const systemScheme = useColorScheme();

  const [isDark, setIsDark] = useState(systemScheme !== 'light');
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = useMemo(() => makeStyles(colors), [isDark]);

  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalEditing, setIsModalEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  
  const [searchText, setSearchText] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [sortType, setSortType] = useState<SortType>('interview_old');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ targetField: null, year: null, month: null, week: null });
  const [sortVisible, setSortVisible] = useState(false);
  const [dateVisible, setDateVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('面接');
  const [quickTypeFilter, setQuickTypeFilter] = useState<TypeFilter>('すべて');
  const [displayPeriod, setDisplayPeriod] = useState<PeriodType>('all'); // デフォルトを全期間に

  const screenSlideAnim = useRef(new Animated.Value(0)).current;
  const SERVER_URL = 'https://kisha-arthrodial-norene.ngrok-free.dev';

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [0, 1, 2, 3, 4, 5].map(i => String(y - i));
  }, []);

  const parseDateToNumber = (dateStr: any) => {
    if (!dateStr || typeof dateStr !== 'string') return 0;
    const cleanDate = dateStr.replace(/[/ー]/g, '-');
    const d = new Date(cleanDate);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  useEffect(() => { handleSearch(true); }, []);

  const filteredData = useMemo(() => {
    let items = [...results];
    const isSearchActive = searchText !== '';

    // 1. フリーワード検索
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      items = items.filter(p => {
        const name = ((p as any)["お名前"] || '').toLowerCase();
        const genji = ((p as any)["源氏名"] || '').toLowerCase();
        return name.includes(lowerSearch) || genji.includes(lowerSearch);
      });
    }

    // 2. キャスト・スタッフ絞り込み
    if (quickTypeFilter !== 'すべて') {
      items = items.filter(p => (p as any)["シート区分"] === quickTypeFilter);
    }

    // 3. 各タブごとのステータス絞り込み
    if (activeTab === '審査中') items = items.filter(p => (p as any)["ステータス"] === "審査中");
    else if (activeTab === '体験') items = items.filter(p => (p as any)["ステータス"] === "体験中");
    else if (activeTab === '不採用') items = items.filter(p => (p as any)["ステータス"] === "不採用");
    else if (activeTab === '在籍') items = items.filter(p => (p as any)["ステータス"] === "在籍中");
    else if (activeTab === '退店') items = items.filter(p => (p as any)["ステータス"] === "退店済み");

    // 4. 期間による絞り込み（全タブ共通適用・ただし「全て」が選ばれていない場合）
    if (!isSearchActive && displayPeriod !== 'all') {
      let dateKey = "面接日";
      if (activeTab === '体験') dateKey = "体験日";
      else if (activeTab === '在籍') dateKey = "入店日";
      else if (activeTab === '退店') dateKey = "退店日";

      const today = new Date();
      const filterStartDate = new Date();
      if (displayPeriod === '1week') filterStartDate.setDate(today.getDate() - 7);
      else if (displayPeriod === '1month') filterStartDate.setMonth(today.getMonth() - 1);

      items = items.filter(p => {
        const time = parseDateToNumber((p as any)[dateKey]);
        if (time === 0) return false;

        if (activeTab === '体験') {
          const todayMidnight = new Date().setHours(0, 0, 0, 0);
          const nextWeek = todayMidnight + (7 * 86400000);
          return time >= filterStartDate.getTime() && time <= nextWeek;
        }
        return time >= filterStartDate.getTime() && time <= today.getTime() + 86400000;
      });
    }

    // 5. カレンダーでの指定日絞り込み
    if (dateFilter.targetField) {
      items = items.filter(p => {
        const val = (p as any)[dateFilter.targetField!] as string;
        if (!val) return false;
        const dateParts = val.split(/[/ー-]/).map(s => s.trim());
        if (dateParts.length < 3) return false;
        const y = dateParts[0];
        const m = parseInt(dateParts[1], 10);
        const d = parseInt(dateParts[2], 10);
        if (dateFilter.year && y !== dateFilter.year) return false;
        if (dateFilter.month && m !== parseInt(dateFilter.month, 10)) return false;
        if (dateFilter.week) {
          const targetWeek = Math.ceil(d / 7);
          if (targetWeek !== parseInt(dateFilter.week, 10)) return false;
        }
        return true;
      });
    }

    // 並び替え
    items.sort((a, b) => {
      let dateKey = "面接日";
      if (activeTab === '在籍') dateKey = "入店日";
      if (activeTab === '退店') dateKey = "退店日";
      const timeA = parseDateToNumber((a as any)[dateKey]);
      const timeB = parseDateToNumber((b as any)[dateKey]);
      if (sortType === 'interview_old') return timeA - timeB;
      if (sortType === 'interview_new' || sortType === 'default') return timeB - timeA;
      if (sortType === 'age_asc') return parseInt((a as any)["年齢"] || "999") - parseInt((b as any)["年齢"] || "999");
      if (sortType === 'age_desc') return parseInt((b as any)["年齢"] || "0") - parseInt((a as any)["年齢"] || "0");
      return 0;
    });

    return items;
  }, [results, sortType, activeTab, searchText, quickTypeFilter, displayPeriod, dateFilter]);

  const sections: PersonSection[] = useMemo(() => {
    let dateKey = dateFilter.targetField;
    if (!dateKey) {
      if (activeTab === '不採用' || activeTab === '体験') dateKey = '体験日';
      else if (activeTab === '在籍') dateKey = '入店日';
      else if (activeTab === '退店') dateKey = '退店日';
      else dateKey = '面接日';
    }
    const groups: { [key: string]: Person[] } = {};
    filteredData.forEach(p => {
      const dateVal = (p as any)[dateKey!] || "日付なし";
      if (!groups[dateVal]) groups[dateVal] = [];
      groups[dateVal].push(p);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const timeA = parseDateToNumber(a);
      const timeB = parseDateToNumber(b);
      return sortType === 'interview_old' ? timeA - timeB : timeB - timeA;
    });
    if (displayMode === 'grid') return sortedKeys.map(date => ({ title: date, data: [groups[date]] }));
    return sortedKeys.map(date => ({ title: date, data: groups[date] }));
  }, [filteredData, sortType, displayMode, activeTab, dateFilter]);

  const handleBackAnimated = () => {
    Animated.parallel([
      Animated.timing(screenSlideAnim, { toValue: initialScreenWidth, duration: 250, useNativeDriver: true }),
      ...(swipeAnim ? [Animated.timing(swipeAnim, { toValue: 0, duration: 250, useNativeDriver: true })] : [])
    ]).start(() => {
      InteractionManager.runAfterInteractions(() => { onBack(); });
    });
  };

  const toggleDisplayMode = () => {
    if (displayMode === 'grid') setDisplayMode('large');
    else if (displayMode === 'large') setDisplayMode('extraLarge');
    else if (displayMode === 'extraLarge') setDisplayMode('list');
    else setDisplayMode('grid');
  };

  const getModeIcon = (): any => {
    if (displayMode === 'list') return 'list';
    if (displayMode === 'large') return 'square';
    if (displayMode === 'extraLarge') return 'tablet-landscape';
    return 'grid';
  };

  const handleSearch = async (isInitial = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/search`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      const json = await res.json();
      if (json.status === 'success') setResults(json.data);
    } catch (e) {
      if (!isInitial) Alert.alert("エラー", "通信失敗。");
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async (p: Person) => { await generatePDF(p); };

  const handleTakePhoto = async (person: Person, field: string = "顔写真") => {
    if (!person) return;
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert("エラー", "カメラの使用許可が必要です");
        return;
      }
      const isIdPhoto = field.includes("証明書");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: isIdPhoto ? [16, 10] : [4, 5],
        quality: 0.8
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        const localUri = result.assets[0].uri;
        const formData = new FormData();
        formData.append('file', { uri: localUri, name: `${field}.jpg`, type: 'image/jpeg' } as any);
        formData.append('name', (person as any)["お名前"]);
        formData.append('sheet_type', (person as any)["シート区分"]);
        formData.append('field', field);
        const uploadRes = await fetch(`${SERVER_URL}/upload_image`, {
          method: 'POST',
          headers: { 'ngrok-skip-browser-warning': 'true' },
          body: formData
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.status === 'success') {
          const updatedPerson = { ...person, [field]: uploadJson.image_path };
          const saveRes = await fetch(`${SERVER_URL}/update_data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify(updatedPerson),
          });
          const saveJson = await saveRes.json();
          if (saveJson.status === 'success') {
            setResults(prev => prev.map(r =>
              (r as any)["お名前"] === (person as any)["お名前"] &&
              (r as any)["シート区分"] === (person as any)["シート区分"]
                ? updatedPerson : r
            ));
            setSelectedPerson(updatedPerson);
            Alert.alert("完了", `${field}を撮影・保存しました`);
          }
        }
      }
    } catch (e) {
      Alert.alert("エラー", "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (p: Person) => {
    Alert.alert("確認", "削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除", style: "destructive", onPress: async () => {
          try {
            const res = await fetch(`${SERVER_URL}/delete_data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
              body: JSON.stringify({ "お名前": (p as any)["お名前"], "シート区分": (p as any)["シート区分"] })
            });
            const json = await res.json();
            if (json.status === 'success') setResults(prev => prev.filter(item => (item as any)["お名前"] !== (p as any)["お名前"]));
          } catch (e) { console.error(e); }
        }
      }
    ]);
  };

  const handleOpenModal = (person: Person, shouldEdit: boolean) => {
    setIsModalEditing(shouldEdit);
    setSelectedPerson(person);
  };

  const toggleQuickFilter = () => {
    if (quickTypeFilter === 'すべて') setQuickTypeFilter('キャスト');
    else if (quickTypeFilter === 'キャスト') setQuickTypeFilter('スタッフ');
    else setQuickTypeFilter('すべて');
  };

  const getQuickFilterIcon = (): any => {
    if (quickTypeFilter === 'キャスト') return 'woman';
    if (quickTypeFilter === 'スタッフ') return 'man';
    return 'people';
  };

  const getQuickFilterTheme = () => {
    if (quickTypeFilter === 'キャスト') return { color: colors.castText, bg: colors.castBg, border: colors.castBorder };
    if (quickTypeFilter === 'スタッフ') return { color: colors.staffText, bg: colors.staffBg, border: colors.staffBorder };
    return { color: colors.textSecondary, bg: colors.surface2, border: colors.border };
  };

  const handlePreviewInternal = async (p: Person) => {
    setLoading(true);
    let personToPass = { ...p };
    try {
      const photoData = (p as any)["顔写真"] || (p as any)["写真"] || (p as any)["画像"];
      if (photoData && typeof photoData === 'string') {
        const fullUrl = (photoData.startsWith('file://') || photoData.startsWith('http'))
          ? photoData
          : `${SERVER_URL}/get_image?image_path=${encodeURIComponent(photoData)}`;
        const result = await ImageManipulator.manipulateAsync(
          fullUrl,
          [{ resize: { width: 300 } }],
          { base64: true, format: ImageManipulator.SaveFormat.JPEG }
        );
        (personToPass as any).previewImageBase64 = `data:image/jpeg;base64,${result.base64}`;
      }
    } catch (e) {
      console.log("Preview prep error:", e);
    } finally {
      setLoading(false);
      setIsPreviewMode(true);
      setSelectedPerson(personToPass);
    }
  };

  const qfTheme = getQuickFilterTheme();
  const TABS: TabType[] = ['面接', '審査中', '体験', '不採用', '在籍', '退店'];

  return (
    <View style={[styles.backgroundRoot, { backgroundColor: colors.base }]}>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateX: screenSlideAnim }] },
          {
            shadowOpacity: screenSlideAnim.interpolate({
              inputRange: [0, 100], outputRange: [0, 0.2], extrapolate: 'clamp'
            })
          }
        ]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.statusBarPadding} />

        <SafeAreaView style={styles.headerWrapper}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBackBtn} onPress={handleBackAnimated}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>配属管理</Text>
              <Text style={styles.headerSub}>ASSIGNMENT</Text>
            </View>

            <View style={styles.headerRightGroup}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setIsDark(prev => !prev)}
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={17}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.contentWrapper}>
          <View style={styles.actionBar}>
            {/* 左側：人数表示 ＋ 期間スイッチ */}
            <View style={styles.leftInfoGroup}>
              <Text style={styles.countText}>
                <Text style={styles.countNum}>{filteredData.length}</Text>
                <Text> 名</Text>
              </Text>

              <View style={styles.periodSwitchContainer}>
                <TouchableOpacity
                  style={[styles.periodBtn, displayPeriod === 'all' && styles.periodBtnActive]}
                  onPress={() => setDisplayPeriod('all')}
                >
                  <Text style={[styles.periodBtnText, displayPeriod === 'all' && styles.periodBtnTextActive]}>全て</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodBtn, displayPeriod === '1month' && styles.periodBtnActive]}
                  onPress={() => setDisplayPeriod('1month')}
                >
                  <Text style={[styles.periodBtnText, displayPeriod === '1month' && styles.periodBtnTextActive]}>1ヶ月</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodBtn, displayPeriod === '1week' && styles.periodBtnActive]}
                  onPress={() => setDisplayPeriod('1week')}
                >
                  <Text style={[styles.periodBtnText, displayPeriod === '1week' && styles.periodBtnTextActive]}>1週間</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rightGroup}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSearchVisible(!isSearchVisible)}>
                <Ionicons name="search" size={13} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setSortVisible(true)}>
                <Ionicons name="swap-vertical" size={13} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={toggleDisplayMode}>
                <Ionicons name={getModeIcon()} size={13} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { borderColor: qfTheme.border, backgroundColor: qfTheme.bg, minWidth: 70, justifyContent: 'center' }]}
                onPress={toggleQuickFilter}
              >
                <Ionicons name={getQuickFilterIcon()} size={13} color={qfTheme.color} />
                <Text style={[styles.btnLabel, { color: qfTheme.color }]}>{quickTypeFilter}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isSearchVisible && (
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="お名前や源氏名で検索..."
                placeholderTextColor={colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>
          )}

          <SectionList
            sections={sections}
            stickySectionHeadersEnabled={true}
            keyExtractor={(item, index) => {
              if (displayMode === 'grid') return `grid-group-${index}`;
              return `${(item as Person)["お名前"]}-${index}`;
            }}
            contentContainerStyle={{ paddingBottom: 180 }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.stickyHeaderContainer}>
                <View style={styles.fancyDateHeader}>
                  <View style={styles.fancyDateLine} />
                  <View style={styles.fancyDateCapsule}>
                    <Text style={styles.fancyDateText}>{title}</Text>
                  </View>
                  <View style={styles.fancyDateLine} />
                </View>
              </View>
            )}
            renderItem={({ item }) => {
              if (displayMode === 'grid') {
                const personList = item as Person[];
                return (
                  <View style={styles.gridWrapper}>
                    {personList.map((p, i) => (
                      <PersonCard
                        key={`${(p as any)["お名前"]}-grid-${i}`}
                        person={p} displayMode="grid" colors={colors} serverUrl={SERVER_URL}
                        screenWidth={currentScreenWidth}
                        onPress={(shouldEdit) => { setIsPreviewMode(false); handleOpenModal(p, !!shouldEdit); }}
                        onPreview={() => handlePreviewInternal(p)}
                        onCall={(num) => num ? Linking.openURL(`tel:${num}`) : null}
                        onSMS={(num) => num ? Linking.openURL(`sms:${num}`) : null}
                        onMap={(addr) => addr ? Linking.openURL(Platform.select({ ios: `maps://app?q=${addr}`, android: `geo:0,0?q=${addr}` }) as string) : null}
                        onPDF={handlePDF} onDelete={handleDelete}
                      />
                    ))}
                  </View>
                );
              }
              const singlePerson = item as Person;
              return (
                <View style={styles.listItemContainer}>
                  <PersonCard
                    person={singlePerson} displayMode={displayMode} colors={colors} serverUrl={SERVER_URL}
                    screenWidth={currentScreenWidth}
                    onPress={(shouldEdit) => { setIsPreviewMode(false); handleOpenModal(singlePerson, !!shouldEdit); }}
                    onPreview={() => handlePreviewInternal(singlePerson)}
                    onCall={(num) => num ? Linking.openURL(`tel:${num}`) : null}
                    onSMS={(num) => num ? Linking.openURL(`sms:${num}`) : null}
                    onMap={(addr) => addr ? Linking.openURL(Platform.select({ ios: `maps://app?q=${addr}`, android: `geo:0,0?q=${addr}` }) as string) : null}
                    onPDF={handlePDF} onDelete={handleDelete}
                  />
                </View>
              );
            }}
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingPlaceholder}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.placeholderText}>情報を取得しています...</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsSearchVisible(true)} activeOpacity={0.7} style={styles.emptyButton}>
                  <Ionicons name="search-outline" size={40} color={colors.primaryBorder} />
                  <Text style={styles.placeholderText}>該当するデータが見つかりません</Text>
                </TouchableOpacity>
              )
            }
            ListHeaderComponent={
              dateFilter.targetField ? (
                <View style={{ paddingHorizontal: 16, marginBottom: 10, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
                  <View style={styles.filterBar}>
                    <Text style={styles.filterBarText}>
                      {dateFilter.targetField}: {dateFilter.year}年 {dateFilter.month ? `${dateFilter.month}月` : ''}
                    </Text>
                    <TouchableOpacity onPress={() => setDateFilter({ targetField: null, year: null, month: null, week: null })}>
                      <Ionicons name="close-circle" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            }
          />
        </View>

        {/* ボトムタブバー (横スクロール仕様) */}
        <View style={styles.bottomTabBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomTabBarInner}
            bounces={true}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <SortModal visible={sortVisible} onClose={() => setSortVisible(false)} sortType={sortType} setSortType={setSortType} />
        <DateFilterModal visible={dateVisible} onClose={() => setDateVisible(false)} filter={dateFilter} setFilter={setDateFilter} yearOptions={yearOptions} />
        <PersonDetailModal
          visible={!!selectedPerson}
          person={selectedPerson}
          initialEditState={isModalEditing}
          initialPreviewState={isPreviewMode}
          onClose={() => { setSelectedPerson(null); setIsModalEditing(false); setIsPreviewMode(false); }}
          onTakePhoto={handleTakePhoto}
          onUpdate={u => {
            if (!u) setResults(results.filter(r => (r as any)["お名前"] !== (selectedPerson as any)!["お名前"]));
            else setResults(results.map(r => (r as any)["お名前"] === (u as any)["お名前"] ? u : r));
            setSelectedPerson(u);
          }}
        />
      </Animated.View>
    </View>
  );
}