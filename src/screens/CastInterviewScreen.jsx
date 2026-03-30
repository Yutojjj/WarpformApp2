import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import InputField from '../components/InputField';
import Section from '../components/Section';

export default function CastInterviewScreen() {
  const themeColor = '#FF77A9';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF0F5' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>【テスト表示】面接フォーム</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="基本プロフィール" themeColor={themeColor}>
          <InputField label="お名前" placeholder="例：山田 花子" />
          <InputField label="かな" placeholder="例：やまだ はなこ" />
        </Section>
        
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>※この画面が見えていれば成功です！</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 20, alignItems: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF77A9' },
  content: { padding: 16 },
});