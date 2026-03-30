import React from 'react';
import { StyleSheet, View } from 'react-native';
// 2つ上の階層(../../)に戻ってから src フォルダを見に行く設定です
import CastInterviewScreen from '../../src/screens/CastInterviewScreen';

export default function Page() {
  return (
    <View style={styles.container}>
      <CastInterviewScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});