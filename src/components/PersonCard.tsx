import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Person } from '../types';

interface Props {
    person: Person;
    displayMode: 'list' | 'large' | 'grid' | 'extraLarge';
    onPress: (isEdit?: boolean) => void;
    onPreview?: () => void;
    onCall: (phone?: string) => void;
    onSMS: (phone?: string) => void;
    onMap: (address?: string) => void;
    onPDF: (person: Person) => void;
    onDelete: (person: Person) => void;
    colors: any;
    serverUrl: string;
    screenWidth: number;
}

// 写真なし時：ニュートラルグレー（ダーク/ライト両対応）
const DEFAULT_AVATAR_URI = 'https://via.placeholder.com/150/808080/FFFFFF?text=No+Photo';

const formatShortDate = (dateStr?: string | number, isResignationDate = false) => {
    if (!dateStr) return '';
    let str = String(dateStr).trim();
    if (isResignationDate) return str;
    str = str.replace(/^[0-9０-９]{4}[/.\-／．－年：:\s]?/, '');
    str = str.replace(/日$/, '');
    return str;
};

export default function PersonCard({
    person,
    displayMode,
    onPress,
    onPreview,
    onCall,
    onSMS,
    onMap,
    onPDF,
    onDelete,
    colors,
    serverUrl,
    screenWidth
}: Props) {
    const p = person as any;

    // ─── 画像URL ──────────────────────────────────────────────
    let imageUrl = DEFAULT_AVATAR_URI;
    if (p["顔写真"]) {
        const photoPath = String(p["顔写真"]);
        if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
            imageUrl = photoPath;
        } else if (!photoPath.startsWith('file://')) {
            imageUrl = `${serverUrl}/get_image?image_path=${encodeURIComponent(photoPath)}`;
        }
    }

    // ─── テーマカラー ──────────────────────────────────────────
    const isStaff   = p["シート区分"] === 'スタッフ';
    const themeBg     = isStaff ? colors.staffBg    : colors.castBg;
    const themeText   = isStaff ? colors.staffText  : colors.castText;  
    const themeBorder = isStaff ? colors.staffBorder : colors.castBorder;

    const statusChar = p["ステータス"] ? String(p["ステータス"]).charAt(0) : '';

    // ─── 日付文字列 ───────────────────────────────────────────
    const dateList: string[] = [];
    if (p["面接日"]) dateList.push(`面:${formatShortDate(p["面接日"])}`);
    if (p["体験日"]) dateList.push(`体:${formatShortDate(p["体験日"])}`);
    if (p["採用日"]) dateList.push(`採:${formatShortDate(p["採用日"])}`);
    if (p["退店日"]) dateList.push(`退:${formatShortDate(p["退店日"], true)}`);
    const datesStr = dateList.join(' | ');

    // ─── グリッド列数 ─────────────────────────────────────────
    const spacing    = 9;
    const numColumns = screenWidth > 800 ? 5 : screenWidth > 600 ? 4 : 3;
    const gridWidth  = (screenWidth - 28 - spacing * (numColumns - 1)) / numColumns;

    // ══════════════════════════════════════════════
    // グリッドモード（中アイコン）
    // ══════════════════════════════════════════════
    if (displayMode === 'grid') {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={[
                    styles.gridCard,
                    // ★ ここの背景色と枠線をテーマカラー（themeBg / themeBorder）に変更
                    { width: gridWidth, backgroundColor: themeBg, borderColor: themeBorder }
                ]}
                onPress={() => onPress(false)}
            >
                {/* 写真エリア */}
                <ImageBackground
                    source={{ uri: imageUrl }}
                    // ★ 画像の後ろの背景は白にしておくことで、テキスト欄だけが色付きに見えます
                    style={[styles.avatarGrid, { height: gridWidth * 1.28, backgroundColor: colors.surface }]}
                >
                    {statusChar ? (
                        <View style={[styles.gridBadge, { backgroundColor: themeText, borderColor: colors.surface }]}>
                            <Text style={[styles.gridBadgeText, { color: '#FFFFFF' }]}>{statusChar}</Text>
                        </View>
                    ) : null}
                </ImageBackground>

                {/* テキストエリア */}
                <View style={styles.gridInfo}>
                    <Text style={[styles.gridName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {p["お名前"] || p["源氏名"] || "No Name"}
                    </Text>
                    {datesStr ? (
                        <Text style={[styles.gridDates, { color: colors.textSecondary }]} numberOfLines={2}>
                            {datesStr}
                        </Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    }

    // ══════════════════════════════════════════════
    // リストモード
    // ══════════════════════════════════════════════
    if (displayMode === 'list') {
        return (
            <View style={[
                styles.listCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderLeftColor: themeText,  
                }
            ]}>
                <TouchableOpacity style={styles.listTouch} onPress={() => onPress(false)}>
                    <View style={styles.listAvatarWrap}>
                        <ImageBackground
                            source={{ uri: imageUrl }}
                            style={[styles.listAvatar, { backgroundColor: colors.surface }]}
                            imageStyle={styles.listAvatarImage}
                        >
                            {statusChar ? (
                                <View style={[styles.listBadge, { backgroundColor: themeText, borderColor: colors.surface }]}>
                                    <Text style={[styles.listBadgeText, { color: '#FFFFFF' }]}>{statusChar}</Text>
                                </View>
                            ) : null}
                        </ImageBackground>
                    </View>

                    <View style={styles.listInfo}>
                        <View style={styles.listNameRow}>
                            <Text style={[styles.listName, { color: colors.textPrimary }]} numberOfLines={1}>
                                {p["お名前"] || p["源氏名"]}
                            </Text>
                            {p["年齢"] ? (
                                <View style={[styles.listAgeBadge, { backgroundColor: themeBg, borderColor: themeBorder }]}>
                                    <Text style={[styles.listAgeText, { color: themeText }]}>{p["年齢"]}歳</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={[styles.listDates, { color: colors.textSecondary }]} numberOfLines={1}>
                            {datesStr || '日付未登録'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.listAction, { borderLeftColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.listActionBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}
                        onPress={onPreview}
                    >
                        <Ionicons name="id-card-outline" size={17} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ══════════════════════════════════════════════
    // ラージ / エクストララージモード
    // ══════════════════════════════════════════════
    const isEx = displayMode === 'extraLarge';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[
                isEx ? styles.exCard : styles.largeCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            onPress={() => onPress(false)}
        >
            <ImageBackground
                source={{ uri: imageUrl }}
                style={[
                    isEx ? styles.exHero : styles.largeHero,
                    { backgroundColor: colors.surface }
                ]}
                imageStyle={isEx ? undefined : styles.largeHeroImage}
            >
                {/* ステータスバッジ */}
                {statusChar ? (
                    <View style={[
                        isEx ? styles.exBadge : styles.largeBadge,
                        { backgroundColor: themeText, borderColor: colors.surface }
                    ]}>
                        <Text style={[isEx ? styles.exBadgeText : styles.largeBadgeText, { color: '#FFFFFF' }]}>
                            {statusChar}
                        </Text>
                    </View>
                ) : null}

                {/* 下部オーバーレイ（テキストボックス） */}
                <View style={[
                    isEx ? styles.exOverlay : styles.largeOverlay,
                    { backgroundColor: colors.surface, borderColor: themeBorder }
                ]}>
                    <View style={styles.overlayInfo}>
                        <View style={styles.overlayTopRow}>
                            <View style={[styles.overlayBadge, { backgroundColor: themeBg, borderColor: themeBorder }]}>
                                <Text style={[styles.overlayBadgeText, { color: themeText }]}>
                                    {p["シート区分"]}
                                </Text>
                            </View>
                            {p["年齢"] ? (
                                <Text style={[styles.overlayAge, { color: colors.textSecondary }]}>
                                    {p["年齢"]}歳
                                </Text>
                            ) : null}
                        </View>
                        <Text style={[styles.overlayName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {p["お名前"] || p["源氏名"]}
                        </Text>
                        {datesStr ? (
                            <Text
                                style={[styles.overlayDates, { color: colors.textSecondary }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {datesStr}
                            </Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.resumeBtn, { borderColor: colors.primaryBorder, backgroundColor: colors.primaryLight }]}
                        onPress={onPreview}
                    >
                        <Ionicons name="id-card" size={isEx ? 24 : 20} color={colors.primary} />
                        <Text style={[styles.resumeBtnText, { color: colors.primary }]}>履歴書</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // ──────────────────────────────────────────────
    // グリッドカード
    // ──────────────────────────────────────────────
    gridCard: {
        marginBottom: 0,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 0.5,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    avatarGrid: {
        width: '100%',
    },
    gridBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    gridBadgeText: { fontSize: 10, fontWeight: '800' },
    gridInfo: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 9 },
    gridName:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.2, marginBottom: 3 },
    gridDates: { fontSize: 9, fontWeight: '600', lineHeight: 13 },

    // ──────────────────────────────────────────────
    // リストカード
    // ──────────────────────────────────────────────
    listCard: {
        flexDirection: 'row',
        marginBottom: 8,
        borderRadius: 14,
        alignItems: 'stretch',
        borderWidth: 0.5,
        borderLeftWidth: 3,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 3,
    },
    listTouch: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    listAvatarWrap: { position: 'relative', marginRight: 12 },
    listAvatar: { width: 52, height: 52 },
    listAvatarImage: { borderRadius: 11 },
    listBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    listBadgeText: { fontSize: 10, fontWeight: '800' },
    listInfo:    { flex: 1 },
    listNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 7 },
    listName:    { fontSize: 16, fontWeight: '800', letterSpacing: 0.3, flexShrink: 1 },
    listAgeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5 },
    listAgeText:  { fontSize: 10, fontWeight: '800' },
    listDates:    { fontSize: 11, fontWeight: '600' },
    listAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderLeftWidth: 0.5,
    },
    listActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ──────────────────────────────────────────────
    // ラージカード
    // ──────────────────────────────────────────────
    largeCard: {
        marginBottom: 14,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 6,
    },
    largeHero: { width: '100%', height: 300 },
    largeHeroImage: { borderRadius: 18 },
    largeBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    largeBadgeText: { fontSize: 17, fontWeight: '800' },
    largeOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 5,
    },

    // ──────────────────────────────────────────────
    // エクストララージカード
    // ──────────────────────────────────────────────
    exCard: {
        width: '100%',
        marginBottom: 22,
        borderBottomWidth: 0.5,
    },
    exHero: { width: '100%', aspectRatio: 0.8 },
    exBadge: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    exBadgeText: { fontSize: 22, fontWeight: '800' },
    exOverlay: {
        position: 'absolute',
        bottom: 18,
        left: 18,
        right: 18,
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 6,
    },

    // ──────────────────────────────────────────────
    // 共通オーバーレイ
    // ──────────────────────────────────────────────
    overlayInfo: { flex: 1, marginRight: 12 },
    overlayTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 8 },
    overlayBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, borderWidth: 0.5 },
    overlayBadgeText: { fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
    overlayAge:   { fontSize: 12, fontWeight: '700' },
    overlayName:  { fontSize: 21, fontWeight: '800', letterSpacing: 0.5 },
    overlayDates: { fontSize: 11, fontWeight: '600', marginTop: 5 },
    resumeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 11,
        borderWidth: 0.5,
        gap: 3,
    },
    resumeBtnText: { fontSize: 10, fontWeight: '800' },
});