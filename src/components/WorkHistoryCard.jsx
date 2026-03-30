import { Platform, StyleSheet, Text, View } from 'react-native';
import InputField from './InputField';
import SelectButtons from './SelectButtons';

const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

const WorkHistoryCard = ({
  symbol, prefix, data, updateField,
  themeColor = '#FF77A9',
  isNight = false,      // 夜職歴かどうか（ラベルの表記変更用）
  showSales = false,    // キャスト用の「月平均売上」を表示するかどうか
  showType = false      // スタッフ用の「雇用形態」を表示するかどうか
}) => {
  return (
    <View style={[styles.historyCard, { borderColor: themeColor }]}>
      <Text style={[styles.historyLabel, { color: themeColor }]}>
        {isNight ? `夜職歴 ${symbol}` : `昼職歴 ${symbol}`}
      </Text>
      
      <InputField
        label="勤務先（店舗名・会社名）"
        placeholder={isNight ? "例：Club ABC" : "例：株式会社○○"}
        value={data[`${prefix}Name`]}
        onChangeText={(v) => updateField(`${prefix}Name`, v)}
        themeColor={themeColor}
      />
      
      {showType && (
        <SelectButtons
          label="雇用の形態"
          options={['アルバイト', '社員']}
          selectedValue={data[`${prefix}Type`]}
          onSelect={(v) => updateField(`${prefix}Type`, v)}
          themeColor={themeColor}
          customBtnStyle={{ minWidth: '40%', padding: 8 }}
        />
      )}

      <View style={styles.row}>
        <InputField
          label="時給/給与"
          placeholder="例:1500円"
          flex={1}
          value={data[`${prefix}Wage`]}
          onChangeText={(v) => updateField(`${prefix}Wage`, v)}
          themeColor={themeColor}
        />
        <View style={{ width: 10 }} />
        {showSales && (
          <>
            <InputField
              label="月平均売上"
              placeholder="例：150万"
              flex={1}
              value={data[`${prefix}Sales`]}
              onChangeText={(v) => updateField(`${prefix}Sales`, v)}
              themeColor={themeColor}
            />
            <View style={{ width: 10 }} />
          </>
        )}
        <InputField
          label="期間"
          placeholder="例：1年"
          flex={1}
          value={data[`${prefix}Period`]}
          onChangeText={(v) => updateField(`${prefix}Period`, v)}
          themeColor={themeColor}
        />
      </View>

      <View style={styles.row}>
        <InputField
          label="退職日"
          placeholder="例：2024/01"
          flex={1}
          value={data[`${prefix}QuitDate`]}
          onChangeText={(v) => updateField(`${prefix}QuitDate`, v)}
          themeColor={themeColor}
        />
      </View>
      
      <InputField
        label="退職理由"
        multiline
        placeholder="例：移転のため"
        value={data[`${prefix}QuitReason`]}
        onChangeText={(v) => updateField(`${prefix}QuitReason`, v)}
        themeColor={themeColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyLabel: {
    ...fontSettings,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

export default WorkHistoryCard;