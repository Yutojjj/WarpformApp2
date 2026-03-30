import * as Print from 'expo-print';
import { Person } from '../types';

export const generatePDF = async (p: Person) => {
  try {
    // 判定：キャストかスタッフか
    const isCast = p["シート区分"] === "キャスト" || (p["希望時給"] !== undefined && p["希望時給"] !== "");
    
    // 🎨 色の設定（原本のイメージに合わせた配色）
    const THEME = isCast ? {
      main: "#F43F5E",       // 濃いピンク
      bgHeader: "#FFE4E6",   // 薄いピンク（見出し背景）
      border: "#FDA4AF",     // 罫線
      title: "キャストエントリーシート"
    } : {
      main: "#0EA5E9",       // 濃いブルー
      bgHeader: "#E0F2FE",   // 薄いブルー（見出し背景）
      border: "#7DD3FC",     // 罫線
      title: "アルバイト / 社員 面接書"
    };

    const SERVER_URL = 'https://kisha-arthrodial-norene.ngrok-free.dev';
    const val = (key: string) => (p[key] !== undefined && p[key] !== null && p[key] !== "") ? p[key] : "　";

    // 顔写真
    let photoHtml = '';
    if (p["顔写真"]) {
      const imageUrl = `${SERVER_URL}/get_image?image_path=${encodeURIComponent(p["顔写真"])}`;
      photoHtml = `<img src="${imageUrl}" style="width:110px; height:140px; object-fit:cover; display:block; margin: 0 auto;"/>`;
    } else {
      photoHtml = `<div style="width:110px; height:140px; background-color:#F1F5F9; border:1px solid ${THEME.border}; display:flex; align-items:center; justify-content:center; color:#94A3B8; font-size:10px; margin: 0 auto;">( 写真 )</div>`;
    }

    // ==========================================
    // 📝 キャスト用：原本レイアウト完全再現
    // ==========================================
    const castHtml = `
      <table class="main-table">
        <tr>
          <th width="10%">面接日</th><td width="15%">${val("面接日")}</td>
          <th width="10%">店名</th><td width="15%">WARP</td>
          <th width="10%">社外部</th><td width="15%">${val("社外部")}</td>
          <th width="10%">メモ欄</th><td>${val("メモ欄")}</td>
        </tr>
        <tr>
          <th>体験日</th><td>${val("体験日")}</td>
          <th>採用日</th><td>${val("採用日")}</td>
          <th>退店日</th><td>${val("退店日")}</td>
          <td colspan="2"></td>
        </tr>
      </table>

      <table class="main-table" style="margin-top: 10px;">
        <tr>
          <th rowspan="4" width="120px" class="photo-cell">${photoHtml}</th>
          <th width="12%">ステータス</th><td width="20%">${val("ステータス")}</td>
          <th width="12%">名前(かな)</th><td width="20%">${val("かな")}</td>
          <th width="12%">希望時給</th><td>${val("希望時給")}</td>
        </tr>
        <tr>
          <th>お名前</th><td class="bold-text">${val("お名前")}</td>
          <th>週何日入れる？</th><td>${val("週何回入れますか")}</td>
          <th>何曜日入れる？</th><td>${val("何曜日入れますか")}</td>
        </tr>
        <tr>
          <th>現住所</th><td colspan="3">${val("現住所")}</td>
          <th>志望動機</th><td>${val("志望動機(選択)")} ${val("志望動機(詳細理由)")}</td>
        </tr>
        <tr>
          <th>本籍地</th><td colspan="3">${val("本籍地(選択)")} ${val("本籍地(詳細)")}</td>
          <th>保証時給/期間</th><td>${val("保証時給")} / ${val("保証期間")}</td>
        </tr>
      </table>

      <table class="main-table">
        <tr>
          <th width="15%">生年月日</th><td width="35%">${val("生年月日(年)")}年 ${val("生年月日(月)")}月 ${val("生年月日(日)")}日 (${val("年齢")}歳 / ${val("干支")})</td>
          <th width="15%">売上目標</th><td width="35%">${val("売上目標")}</td>
        </tr>
        <tr>
          <th>携帯番号</th><td>${val("携帯番号")}</td>
          <th>その他金額</th><td>${val("その他金額")}</td>
        </tr>
        <tr>
          <th>血液型</th><td>${val("血液型")}</td>
          <th>お探しの条件</th><td>${val("お探しの条件")}</td>
        </tr>
        <tr>
          <th>体験時時間</th><td>${val("体験時時間(選択)")} ${val("体験時時間(詳細)")}</td>
          <th>特殊条件</th><td>${val("特殊条件")}</td>
        </tr>
        <tr>
          <th>入店後時間</th><td>${val("入店後時間(選択)")} ${val("入店後時間(詳細)")}</td>
          <th>X(Twitter)</th><td>ID: ${val("X(Twitter) ID")} / フォロワー: ${val("Xフォロワー")}</td>
        </tr>
        <tr>
          <th>送り先(体験)</th><td>${val("送り先エリア(体験時・選択)")} ${val("送り先エリア(体験時・詳細)")}</td>
          <th>源氏名</th><td>${val("源氏名")}</td>
        </tr>
        <tr>
          <th>送り先(入店)</th><td>${val("送り先エリア(入店後・選択)")} ${val("送り先エリア(入店後・詳細)")}</td>
          <th>お酒は？</th><td>${val("お酒")}</td>
        </tr>
        <tr>
          <th>お住まい</th><td>${val("お住まい")} ${val("お住まい(詳細)")}</td>
          <th>バースデー</th><td>${val("バースデー")}</td>
        </tr>
        <tr>
          <th>借金</th><td>${val("借金")} ${val("借金(詳細)")}</td>
          <th>趣味</th><td>${val("趣味")}</td>
        </tr>
        <tr>
          <th>持病</th><td>${val("持病")} ${val("持病(詳細)")}</td>
          <th>特技</th><td>${val("特技")}</td>
        </tr>
        <tr>
          <th>保有資格</th><td>${val("保有資格")}</td>
          <th>タトゥー</th><td>${val("タトゥー")} ${val("タトゥー(詳細)")}</td>
        </tr>
        <tr>
          <th>撮影/掲載</th><td>${val("撮影/掲載")} / ${val("掲載媒体")}</td>
          <th>交通手段</th><td>${val("交通手段")} ${val("交通手段(詳細)")}</td>
        </tr>
        <tr>
          <th>家族構成</th><td>${val("家族構成・パートナー")} ${val("お子様の詳細")}</td>
          <th>親・彼氏承諾</th><td>${val("親・彼氏の承諾")}</td>
        </tr>
        <tr>
          <th>同伴・アフター</th><td>${val("同伴・アフター")} ${val("理由(同伴不可)")}</td>
          <th>応募方法</th><td>${val("応募方法")} (${val("応募方法(詳細)")})</td>
        </tr>
      </table>

      <div class="section-title">【夜職歴】</div>
      <table class="main-table">
        <tr class="center"><th>店名</th><th>時給</th><th>売上</th><th>期間</th><th>退職理由</th></tr>
        <tr><td>${val("夜職歴1:店舗名")}</td><td>${val("夜職歴1:時給")}</td><td>${val("夜職歴1:月平均売上")}</td><td>${val("夜職歴1:期間")}</td><td>${val("夜職歴1:退職理由")}</td></tr>
        <tr><td>${val("夜職歴2:店舗名")}</td><td>${val("夜職歴2:時給")}</td><td>${val("夜職歴2:月平均売上")}</td><td>${val("夜職歴2:期間")}</td><td>${val("夜職歴2:退職理由")}</td></tr>
      </table>

      <table class="main-table" style="margin-top: 5px;">
        <tr><th width="15%">紹介者</th><td>${val("紹介者名")}</td></tr>
        <tr><th>身長/体重/胸</th><td>${val("身長")}cm / ${val("体重")}kg / ${val("カップ")}cup (B:${val("B")} W:${val("W")} H:${val("H")})</td></tr>
        <tr><th>緊急連絡先</th><td>氏名: ${val("緊急連絡先:氏名")} (${val("緊急連絡先:続柄(選択)")}) / TEL: ${val("緊急連絡先:電話番号")}</td></tr>
      </table>
    `;

    // ==========================================
    // 📝 スタッフ用：原本レイアウト完全再現
    // ==========================================
    const staffHtml = `
      <table class="main-table">
        <tr>
          <th width="12%">面接日</th><td width="20%">${val("面接日")}</td>
          <th width="12%">店名</th><td width="20%">WARP</td>
          <th width="12%">社外部</th><td>${val("社外部")}</td>
        </tr>
        <tr>
          <th>体験日</th><td>${val("体験日")}</td>
          <th>採用日</th><td>${val("採用日")}</td>
          <th>退職日</th><td>${val("退職日")}</td>
        </tr>
      </table>

      <table class="main-table" style="margin-top: 10px;">
        <tr>
          <th rowspan="3" width="120px" class="photo-cell">${photoHtml}</th>
          <th width="12%">ステータス</th><td width="20%">${val("ステータス")}</td>
          <th width="12%">雇用形態</th><td>${val("雇用形態")}</td>
        </tr>
        <tr>
          <th>名前(かな)</th><td>${val("かな")}</td>
          <th>週何回</th><td>${val("週何回入れますか")}</td>
        </tr>
        <tr>
          <th>お名前</th><td class="bold-text">${val("お名前")}</td>
          <th>何曜日</th><td>${val("何曜日入れますか")}</td>
        </tr>
      </table>

      <table class="main-table">
        <tr>
          <th width="15%">生年月日</th><td width="35%">${val("生年月日(年)")}年 ${val("生年月日(月)")}月 ${val("生年月日(日)")}日</td>
          <th width="15%">志望動機</th><td width="35%">${val("志望動機")}</td>
        </tr>
        <tr>
          <th>現住所</th><td>${val("現住所")}</td>
          <th>勤務時間</th><td>${val("勤務時間(選択)")} ${val("具体的な勤務時間(その他)")}</td>
        </tr>
        <tr>
          <th>本籍地</th><td>${val("本籍地(選択)")} ${val("本籍地(詳細)")}</td>
          <th>お探しの条件</th><td>${val("お探しのお店の条件")}</td>
        </tr>
        <tr>
          <th>学校/学歴</th><td>${val("学校名・学年/最終学歴")}</td>
          <th>お住まい</th><td>${val("お住まい")} ${val("お住まい(詳細)")}</td>
        </tr>
        <tr>
          <th>携帯番号</th><td>${val("携帯番号")}</td>
          <th>年齢/干支</th><td>${val("年齢")}歳 / ${val("干支")}</td>
        </tr>
        <tr>
          <th>性別</th><td>${val("性別")}</td>
          <th>交通手段</th><td>${val("交通手段")}</td>
        </tr>
        <tr>
          <th>保有資格</th><td>${val("保有資格")}</td>
          <th>家族構成</th><td>${val("家族構成・パートナー")} ${val("家族構成詳細")}</td>
        </tr>
        <tr>
          <th>趣味</th><td>${val("趣味")}</td>
          <th>特技</th><td>${val("特技")}</td>
        </tr>
        <tr>
          <th>タトゥー</th><td>${val("タトゥー")} ${val("タトゥー(詳細)")}</td>
          <th>特殊条件</th><td>${val("特殊条件")}</td>
        </tr>
        <tr>
          <th>持病</th><td>${val("持病の有無")} ${val("持病(詳細)")}</td>
          <th>借金</th><td>${val("借金")} ${val("借金(詳細)")}</td>
        </tr>
        <tr>
          <th>応募方法</th><td>${val("応募方法")} (${val("応募方法(詳細)")})</td>
          <th>紹介者/その他金</th><td>紹介者: ${val("紹介者名")} / ￥${val("その他金額")}</td>
        </tr>
      </table>
    `;

    // 🖨️ PDF全体のスタイル定義
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { margin: 12mm; }
            body { 
              font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif; 
              color: #1F2937; 
              font-size: 10px; 
              line-height: 1.4;
              background-color: #fff;
            }
            .header-title { 
              text-align: center; 
              font-size: 22px; 
              font-weight: bold; 
              color: ${THEME.main}; 
              border-bottom: 3px solid ${THEME.main}; 
              padding-bottom: 8px; 
              margin-bottom: 15px;
              letter-spacing: 3px;
            }
            .main-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: -1px; /* 枠線の重複を防ぐ */
              table-layout: fixed;
            }
            .main-table th, .main-table td { 
              border: 1px solid ${THEME.border}; 
              padding: 6px 8px; 
              vertical-align: middle;
            }
            .main-table th { 
              background-color: ${THEME.bgHeader}; 
              text-align: left; 
              font-size: 9px; 
              color: #374151;
              font-weight: bold;
            }
            .main-table td { 
              background-color: #ffffff;
            }
            .photo-cell {
              text-align: center;
              padding: 4px !important;
              background-color: #fff !important;
            }
            .section-title {
              background-color: ${THEME.main};
              color: white;
              padding: 3px 10px;
              font-weight: bold;
              margin-top: 10px;
              font-size: 11px;
            }
            .bold-text { font-size: 14px; font-weight: bold; }
            .center { text-align: center; }
            .footer {
              text-align: right;
              font-size: 8px;
              color: #9CA3AF;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header-title">${THEME.title}</div>
          ${isCast ? castHtml : staffHtml}
          <div class="footer">出力日時: ${new Date().toLocaleString('ja-JP')} | WARP Management System</div>
        </body>
      </html>
    `;

    await Print.printAsync({ html });
  } catch (error) {
    console.error("PDF生成失敗:", error);
    alert("PDFの生成中にエラーが発生しました。");
  }
};