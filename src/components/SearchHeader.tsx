import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onBack: () => void;
  onOpenMenu: () => void;
  onToggleMode: () => void;
  onOpenSort: () => void;
  onOpenDate: () => void;
  displayMode: 'list' | 'large' | 'grid' | 'extraLarge'; // ★ boolean から変更
  hasDateFilter: boolean;
  colors: any;
}

export default function SearchHeader({ 
  onBack, onOpenMenu, onToggleMode, onOpenSort, onOpenDate, displayMode, hasDateFilter, colors 
}: Props) {
  
  // ★モードに応じたアイコンの取得
  const getModeIcon = () => {
    if (displayMode === 'list') return 'list';
    if (displayMode === 'large') return 'square';
    if (displayMode === 'extraLarge') return 'tablet-landscape';
    return 'grid';
  };

  return (
    <View>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>配属管理</Text>
          <TouchableOpacity style={styles.headerMenuButton} onPress={onOpenMenu}>
            <Ionicons name="filter-circle" size={38} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.topActionBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={16} color={colors.accent} />
          <Text style={styles.backButtonText}>メニューへ戻る</Text>
        </TouchableOpacity>

        <View style={styles.rightActionGroup}>
          <TouchableOpacity 
            style={[styles.iconSettingButton, hasDateFilter && { borderColor: colors.accent }]} 
            onPress={onOpenDate}
          >
            <Ionicons name="calendar" size={18} color={hasDateFilter ? colors.accent : colors.textSecondary} />
            <Text style={[styles.settingButtonText, hasDateFilter && { color: colors.accent }]}>日付検索</Text>
          </TouchableOpacity>

          {/* ★表示切替ボタン */}
          <TouchableOpacity style={[styles.iconSettingButton, { borderColor: colors.accent }]} onPress={onToggleMode}>
            <Ionicons name={getModeIcon() as any} size={20} color={colors.accent} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconSettingButton} onPress={onOpenSort}>
            <Ionicons name="swap-vertical" size={20} color={colors.textSecondary} />
            <Text style={styles.settingButtonText}>順序</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  header: { height: 60, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#D4AF37', letterSpacing: 4, textTransform: 'uppercase' },
  headerMenuButton: { position: 'absolute', right: 20 },
  topActionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 15, marginBottom: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25, borderWidth: 1, borderColor: '#D4AF3744', backgroundColor: '#1A1A1A' },
  backButtonText: { fontSize: 13, color: '#D4AF37', fontWeight: '800', marginLeft: 4 },
  rightActionGroup: { flexDirection: 'row', alignItems: 'center' },
  iconSettingButton: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1, borderColor: '#2C2C2E', backgroundColor: '#1A1A1A', marginLeft: 6 },
  settingButtonText: { color: '#8E8E93', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
});