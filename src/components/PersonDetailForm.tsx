import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Person } from '../types';

interface Props {
  editedData: Person;
  isEditing: boolean;
  activeSection: 'admin' | 'basic' | 'body' | 'contact' | 'salary' | 'job' | 'history' | 'others';
  onChange: (key: string, value: string) => void;
  pdfTheme: { bg: string, border: string, text: string }; 
}

// セクション見出し
const SectionHeader = ({ title, theme }: { title: string, theme: any }) => (
  <View style={[styles.sectionHeader, { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1 }]}>
    <Text style={[styles.sectionTitle, { color: '#333' }]}>{title}</Text>
  </View>
);

// 日付を yyyy/mm/dd 形式に変換するヘルパー
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = ('00' + (date.getMonth() + 1)).slice(-2);
  const d = ('00' + date.getDate()).slice(-2);
  return `${y}/${m}/${d}`;
};

export default function PersonDetailForm({ editedData, isEditing, activeSection, onChange, pdfTheme }: Props) {
  const isCast = editedData["シート区分"] === "キャスト";
  const [showPicker, setShowPicker] = useState<string | null>(null);

  // 通常の入力フィールド
  const renderInput = (label: string, key: string, placeholder = "", flex = 1) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <View style={[styles.inputWrapper, { flex: flex }]}>
        <View style={[styles.labelContainer, { backgroundColor: pdfTheme.bg, borderColor: pdfTheme.border }]}>
          <Text style={[styles.label, { color: '#333' }]}>{label}</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: pdfTheme.border, 
              borderWidth: isFocused ? 2 : 1, 
              backgroundColor: '#FFFFFF',
              color: '#333333'
            }
          ]}
          value={String(editedData[key] || '')}
          onChangeText={(text: string) => onChange(key, text)}
          placeholder={placeholder}
          placeholderTextColor="#CCC"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    );
  };

  // テキストエリア（メモ欄など）
  const renderTextArea = (label: string, key: string, placeholder = "") => (
    <View style={styles.inputWrapper}>
      <View style={[styles.labelContainer, { backgroundColor: pdfTheme.bg, borderColor: pdfTheme.border }]}>
        <Text style={[styles.label, { color: '#333' }]}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.textArea,
          { borderColor: pdfTheme.border, borderWidth: 1, backgroundColor: '#FFFFFF', color: '#333333', textAlignVertical: 'top', paddingTop: 14 }
        ]}
        value={String(editedData[key] || '')}
        onChangeText={(text: string) => onChange(key, text)}
        multiline={true}
        numberOfLines={3}
        placeholder={placeholder}
        placeholderTextColor="#CCC"
      />
    </View>
  );

  // ★ カレンダー入力フィールド
  const renderDateInput = (label: string, key: string, flex = 1) => {
    const displayValue = editedData[key] || "日付を選択";
    
    // 現在の値をDate型に変換（空なら今日）
    let currentDate = new Date();
    if (editedData[key]) {
      const parts = String(editedData[key]).split('/');
      if (parts.length === 3) {
        currentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }

    return (
      <View style={[styles.inputWrapper, { flex: flex }]}>
        <View style={[styles.labelContainer, { backgroundColor: pdfTheme.bg, borderColor: pdfTheme.border }]}>
          <Text style={[styles.label, { color: '#333' }]}>{label}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.input, { borderColor: pdfTheme.border, borderWidth: 1, backgroundColor: '#FFFFFF', justifyContent: 'center' }]}
          onPress={() => setShowPicker(key)}
        >
          <Text style={{ color: editedData[key] ? '#333' : '#CCC', fontSize: 15 }}>
            {displayValue}
          </Text>
        </TouchableOpacity>

        {showPicker === key && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowPicker(null);
              if (selectedDate) {
                onChange(key, formatDate(selectedDate));
                // 生年月日の場合はバラバラの項目も更新しておく（PDF互換性のため）
                if (key === "生年月日") {
                  onChange("生年月日(年)", String(selectedDate.getFullYear()));
                  onChange("生年月日(月)", String(selectedDate.getMonth() + 1));
                  onChange("生年月日(日)", String(selectedDate.getDate()));
                }
              }
            }}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      
      {/* ■ 管理情報 */}
      {activeSection === 'admin' && (
        <View style={styles.section}>
          <SectionHeader title="管理情報" theme={pdfTheme} />
          <View style={styles.row}>
            {renderDateInput("面接日", "面接日")}
            {renderInput("社外部", "社外部")}
          </View>
          <View style={styles.row}>
            {renderDateInput("体験日", "体験日")}
            {renderDateInput("採用日", "採用日")}
          </View>
          <View style={styles.row}>
            {renderDateInput(isCast ? "退店日" : "退職日", isCast ? "退店日" : "退職日")}
            {renderInput("ステータス", "ステータス", "面接前/採用")}
          </View>
          <View style={styles.row}>
            {renderInput("紹介者名", "紹介者名")}
            {!isCast && renderInput("雇用形態", "雇用形態")}
          </View>
          {renderTextArea("メモ欄", "メモ欄")}
        </View>
      )}

      {/* ■ 基本プロフィール */}
      {activeSection === 'basic' && (
        <View style={styles.section}>
          <SectionHeader title="基本プロフィール" theme={pdfTheme} />
          <View style={styles.row}>
            {renderInput("本名", "お名前", "", 2)}
            {renderInput("かな", "かな", "", 2)}
          </View>
          {isCast ? renderInput("源氏名", "源氏名") : renderInput("性別", "性別", "男性/女性")}
          
          <View style={styles.row}>
            {renderDateInput("生年月日", "生年月日", 2)}
            {renderInput("年齢", "年齢", "", 1)}
          </View>
          
          <View style={styles.row}>
            {renderInput("干支", "干支")}
            {renderInput("血液型", "血液型")}
            {!isCast && renderInput("身長", "身長")}
          </View>
          
          <View style={styles.row}>
            {isCast && renderInput("お酒", "お酒", "飲める/飲めない")}
            {!isCast && renderInput("体重", "体重")}
            {renderInput("携帯番号", "携帯番号")}
          </View>

          {renderTextArea("現住所", "現住所")}
          <View style={styles.row}>
            {renderInput("本籍地(選択)", "本籍地(選択)")}
            {renderInput("本籍地(詳細)", "本籍地(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("お住まい(選択)", "お住まい")}
            {renderInput("お住まい(詳細)", "お住まい(詳細)")}
          </View>
        </View>
      )}

      {/* ■ 勤務条件・希望 (キャスト用) */}
      {isCast && activeSection === 'salary' && (
        <View style={styles.section}>
          <SectionHeader title="勤務条件・希望" theme={pdfTheme} />
          <View style={styles.row}>
            {renderInput("希望時給", "希望時給")}
            {renderInput("売上目標", "売上目標")}
          </View>
          <View style={styles.row}>
            {renderInput("保証時給", "保証時給")}
            {renderInput("保証期間", "保証期間")}
          </View>
          <View style={styles.row}>
            {renderInput("週何回", "週何回入れますか")}
            {renderInput("何曜日", "何曜日入れますか")}
          </View>
          <View style={styles.row}>
            {renderInput("あがり(体験時)", "体験時時間(選択)")}
            {renderInput("あがり(入店後)", "入店後時間(選択)")}
          </View>
          {renderInput("あがり入店後(詳細)", "入店後時間(詳細)")}
          <View style={styles.row}>
            {renderInput("同伴・アフター", "同伴・アフター")}
            {renderInput("理由(同伴不可)", "理由(同伴不可)")}
          </View>
          <View style={styles.row}>
            {renderInput("送り先(体験:選択)", "送り先エリア(体験時・選択)")}
            {renderInput("送り先(体験:詳細)", "送り先エリア(体験時・詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("送り先(入店:選択)", "送り先エリア(入店後・選択)")}
            {renderInput("送り先(入店:詳細)", "送り先エリア(入店後・詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("志望動機(選択)", "志望動機(選択)")}
            {renderInput("お探しの条件", "お探しの条件")}
          </View>
          {renderTextArea("志望動機(詳細理由)", "志望動機(詳細理由)")}
          <View style={styles.row}>
            {renderInput("その他金額", "その他金額")}
            {renderInput("特殊条件", "特殊条件")}
          </View>
        </View>
      )}

      {/* ■ SNS・パーソナル情報 (キャスト用) */}
      {isCast && activeSection === 'contact' && (
        <View style={styles.section}>
          <SectionHeader title="SNS・パーソナル情報" theme={pdfTheme} />
          <View style={styles.row}>
            {renderInput("Instagram ID", "Instagram ID")}
            {renderInput("フォロワー", "Instagramフォロワー", "", 0.7)}
          </View>
          <View style={styles.row}>
            {renderInput("TikTok ID", "TikTok ID")}
            {renderInput("フォロワー", "TikTokフォロワー", "", 0.7)}
          </View>
          <View style={styles.row}>
            {renderInput("X(Twitter) ID", "X(Twitter) ID")}
            {renderInput("フォロワー", "Xフォロワー", "", 0.7)}
          </View>
          <View style={styles.row}>
            {renderInput("撮影/掲載", "撮影/掲載")}
            {renderInput("掲載媒体", "掲載媒体")}
          </View>
          <View style={styles.row}>
            {renderInput("借金", "借金", "有/無", 0.7)}
            {renderInput("借金(詳細)", "借金(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("持病", "持病", "有/無", 0.7)}
            {renderInput("持病(詳細)", "持病(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("タトゥー", "タトゥー・刺青", "有/無", 0.7)}
            {renderInput("タトゥー(詳細)", "タトゥー(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("交通手段", "交通手段", "", 0.7)}
            {renderInput("交通手段(詳細)", "交通手段(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("趣味", "趣味")}
            {renderInput("特技", "特技")}
          </View>
          <View style={styles.row}>
            {renderInput("保有資格", "保有資格")}
            {renderInput("バースデー", "バースデー", "mm/dd")}
          </View>
          <View style={styles.row}>
            {renderInput("家族構成・パートナー", "家族構成・パートナー")}
            {renderInput("お子様の詳細", "お子様の詳細")}
          </View>
          <View style={styles.row}>
            {renderInput("親・彼氏の承諾", "親・彼氏の承諾")}
            {renderInput("応募方法", "応募方法")}
          </View>
          {renderInput("応募方法(詳細)", "応募方法(詳細)")}
        </View>
      )}

      {/* ■ 身体サイズ・経験・緊急連絡先 (キャスト用) */}
      {isCast && activeSection === 'body' && (
        <View style={styles.section}>
          <SectionHeader title="身体サイズ・経験・緊急連絡先" theme={pdfTheme} />
          <View style={styles.row}>
            {renderInput("身長(cm)", "身長")}
            {renderInput("体重(kg)", "体重")}
            {renderInput("カップ", "カップ")}
          </View>
          <View style={styles.row}>
            {renderInput("B", "B")}
            {renderInput("W", "W")}
            {renderInput("H", "H")}
          </View>
          <View style={styles.row}>
            {renderInput("水商売の経験", "水商売の経験")}
            {renderInput("レンタル", "レンタル")}
          </View>
          {renderInput("語学", "語学")}
          <View style={styles.row}>
            {renderInput("緊急連絡先:氏名", "緊急連絡先:氏名")}
            {renderInput("続柄(選択)", "緊急連絡先:続柄(選択)", "", 0.7)}
          </View>
          {renderInput("緊急連絡先:電話番号", "緊急連絡先:電話番号")}
          {renderTextArea("緊急連絡先:住所", "緊急連絡先:住所")}
        </View>
      )}

      {/* ■ 連絡先・SNS・条件 (スタッフ用) */}
      {!isCast && activeSection === 'contact' && (
        <View style={styles.section}>
          <SectionHeader title="連絡先・SNS・条件" theme={pdfTheme} />
          <View style={styles.row}>
            {renderInput("メールアドレス", "メールアドレス")}
            {renderInput("PCアドレス", "PCアドレス")}
          </View>
          <View style={styles.row}>
            {renderInput("LINE ID", "LINE ID")}
            {renderInput("Instagram ID", "Instagram ID")}
          </View>
          <View style={styles.row}>
            {renderInput("Facebook ID", "Facebook ID")}
            {renderInput("X(Twitter) ID", "X(Twitter) ID")}
          </View>
          <View style={styles.row}>
            {renderInput("週何回", "週何回入れますか")}
            {renderInput("何曜日", "何曜日入れますか")}
          </View>
          <View style={styles.row}>
            {renderInput("勤務時間(選択)", "勤務時間(選択)")}
            {renderInput("勤務時間(その他)", "具体的な勤務時間(その他)")}
          </View>
          <View style={styles.row}>
            {renderInput("お探しの条件", "お探しのお店の条件")}
            {renderInput("その他金額", "その他金額")}
          </View>
          <View style={styles.row}>
            {renderInput("送りの有無", "送りの有無")}
            {renderInput("送りの場所", "送りの場所")}
          </View>
          {renderInput("送り先住所の詳細", "送り先住所の詳細")}
          <View style={styles.row}>
            {renderInput("交通手段", "交通手段")}
            {renderInput("交通手段(詳細)", "交通手段(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("応募方法", "応募方法")}
            {renderInput("応募方法(詳細)", "応募方法(詳細)")}
          </View>
          {renderTextArea("志望動機", "志望動機")}
          {renderTextArea("特殊条件", "特殊条件")}
        </View>
      )}

      {/* ■ パーソナル情報・経歴 (スタッフ用) */}
      {!isCast && activeSection === 'job' && (
        <View style={styles.section}>
          <SectionHeader title="パーソナル情報・経歴" theme={pdfTheme} />
          <View style={styles.row}>
            {renderInput("現在の職業(昼)", "現在の職業(昼)")}
            {renderInput("稼働状況", "現職業の稼働状況")}
          </View>
          <View style={styles.row}>
            {renderInput("現在の会社名/店名", "現在の会社名/店名")}
            {renderInput("業種", "業種")}
          </View>
          {renderInput("最終学歴", "学校名・学年/最終学歴")}
          <View style={styles.row}>
            {renderInput("趣味", "趣味")}
            {renderInput("特技", "特技")}
          </View>
          <View style={styles.row}>
            {renderInput("語学", "語学")}
            {renderInput("語学(詳細)", "語学(詳細)")}
          </View>
          {renderInput("保有資格", "保有資格")}
          <View style={styles.row}>
            {renderInput("借金", "借金", "有/無")}
            {renderInput("借金(詳細)", "借金(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("持病", "持病の有無", "有/無")}
            {renderInput("持病(詳細)", "持病(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("タトゥー", "タトゥー", "有/無")}
            {renderInput("タトゥー(詳細)", "タトゥー(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("家族構成", "家族構成・パートナー")}
            {renderInput("家族構成詳細", "家族構成詳細")}
          </View>
          {renderInput("夜職経験", "夜職の経験")}
          <View style={styles.row}>
            {renderInput("緊急連絡先:氏名", "緊急連絡先:氏名")}
            {renderInput("電話番号", "緊急連絡先:電話番号")}
          </View>
          <View style={styles.row}>
            {renderInput("続柄(選択)", "緊急連絡先:続柄(選択)")}
            {renderInput("続柄(詳細)", "緊急連絡先:続柄(詳細)")}
          </View>
          <View style={styles.row}>
            {renderInput("住所(選択)", "緊急連絡先:住所(選択)")}
            {renderInput("住所(詳細)", "緊急連絡先:住所(詳細)")}
          </View>
        </View>
      )}

      {/* ■ 職歴 */}
      {activeSection === 'history' && (
        <View style={styles.section}>
          <SectionHeader title="職歴" theme={pdfTheme} />
          
          <View style={styles.row}>
            {renderInput(isCast ? "昼職:会社名" : "現在の会社名/店名", "現在の会社名/店名", "", 2)}
            {renderInput("期間", "在籍期間")}
          </View>
          <View style={styles.row}>
            {renderInput(isCast ? "職業[昼職]" : "業種", isCast ? "現在の職業[昼職]" : "業種", "", 2)}
            {renderInput("給与", isCast ? "月収/給与" : "現在の給与")}
          </View>

          {!isCast && [1, 2, 3].map(num => (
            <View key={`day-${num}`}>
              <View style={[styles.historyDivider, { backgroundColor: pdfTheme.border + '55' }]} />
              <Text style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>▼ 昼職歴 {num}</Text>
              <View style={styles.row}>
                {renderInput("会社名", `昼職歴${num}:社名`, "", 2)}
                {renderInput("給与", `昼職歴${num}:給与`)}
              </View>
              <View style={styles.row}>
                {renderInput("期間", `昼職歴${num}:期間`)}
                {renderDateInput("退職日", `昼職歴${num}:退職日`)}
              </View>
              {renderInput("退職理由", `昼職歴${num}:理由`)}
            </View>
          ))}
          
          {(isCast ? [1, 2, 3, 4, 5] : [1, 2, 3]).map(num => (
            <View key={`night-${num}`}>
              <View style={[styles.historyDivider, { backgroundColor: pdfTheme.border + '55' }]} />
              <Text style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>▼ 夜職歴 {num}</Text>
              <View style={styles.row}>
                {renderInput("店名", isCast ? `夜職歴${num}:店舗名` : `夜職歴${num}:店名`, "", 2)}
                {renderInput("時給/給与", `夜職歴${num}:時給`)}
              </View>
              {isCast && renderInput("月平均売上", `夜職歴${num}:月平均売上`)}
              <View style={styles.row}>
                {renderInput("期間", `夜職歴${num}:期間`)}
                {renderDateInput("退職日", `夜職歴${num}:退職日`)}
              </View>
              {renderInput("退職理由", isCast ? `夜職歴${num}:退職理由` : `夜職歴${num}:理由`)}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    paddingVertical: 6,
    marginBottom: 16,
    borderRadius: 4,
    paddingLeft: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  inputWrapper: {
    marginBottom: 10,
    position: 'relative',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: -12,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, 
    fontSize: 15,
    height: 48,
  },
  textArea: {
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    height: 80,
  },
  historyDivider: {
    height: 1,
    marginVertical: 10,
    width: '100%',
  },
});