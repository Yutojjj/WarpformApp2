import { useState } from 'react';

// initialStateには、キャスト用かスタッフ用かの初期データが入ります
export const useInterviewForm = (initialState) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // 文字が入力された時や、単一選択ボタンが押された時の処理
  const updateField = (key, value) => {
    // 1. 安全な値の取得と新しいフォーム状態の作成
    let newForm = { ...form, [key]: value };
    
    // スタッフ用画面特有の連動リセット処理
    if (key === 'hireCondition') { 
      newForm.workTime = ''; 
      newForm.workTimeCustom = ''; 
    }
    if (key === 'applyMethod' && !['紹介', 'WARPスタッフの紹介'].includes(value)) { 
      newForm.introducer = ''; 
    }

    setForm(newForm);
    setIsSent(false);
    
    // 2. エラー消去ロジックの安全性向上（null/undefined/数値 対策）
    const isNotEmpty = value !== null && value !== undefined && value.toString().trim() !== '';
    if (isNotEmpty) { 
      setErrors(prev => ({ ...prev, [key]: false })); 
    }
    setSubmitError("");
  };

  // 複数選択ボタンが押された時の処理
  const toggleMulti = (key, val) => {
    // form[key] が配列であることを保証しつつコピー
    const currentList = Array.isArray(form[key]) ? form[key] : [];
    let newList = [...currentList];

    if (newList.includes(val)) { 
      newList = newList.filter(v => v !== val); 
    } else { 
      newList.push(val); 
    }
    
    // updateField を通じて更新
    updateField(key, newList);
    
    if (newList.length > 0) { 
      setErrors(prev => ({ ...prev, [key]: false })); 
    }
  };

  // 送信完了画面を閉じる時の処理（フォームを完全に初期化するよう修正）
  const resetForm = () => {
    setIsSent(false);
    setForm(initialState); // フォームを初期状態に戻す
    setErrors({});          // エラーをクリア
    setIsAgreed(false);    // 同意チェックを外す
    setSubmitError("");    // 送信エラーをクリア
  };

  return {
    form,
    errors,
    setErrors,
    isAgreed,
    setIsAgreed,
    submitError,
    setSubmitError,
    isSubmitting,
    setIsSubmitting,
    isSent,
    setIsSent,
    updateField,
    toggleMulti,
    resetForm
  };
};