import Papa from 'papaparse';

const REQUIRED_HEADERS = ['No', 'Question', 'Answer', 'Note'];

function normalizeHeader(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim();
}

/**
 * File オブジェクトを受け取り、正規化済み問題配列を返す
 * @param {File} file
 * @returns {Promise<Array<{no: string, question: string, answer: string, note: string}>>}
 */
export function parseQuestionsCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = String(e.target.result ?? '').replace(/^\uFEFF/, '');

        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: normalizeHeader,
        });

        if (result.errors.length > 0) {
          const msg = result.errors[0]?.message ?? 'CSV の解析に失敗しました。';
          throw new Error(`CSV 解析エラー: ${msg}`);
        }

        const headers = result.meta.fields ?? [];
        for (const key of REQUIRED_HEADERS) {
          if (!headers.includes(key)) {
            throw new Error(
              `CSV ヘッダーに "${key}" が見つかりません。必須列: ${REQUIRED_HEADERS.join(', ')}`
            );
          }
        }

        const rows = result.data.map((row, index) => ({
          no: String(row.No ?? '').trim() || String(index + 1),
          question: String(row.Question ?? '').trim(),
          answer: String(row.Answer ?? '').trim(),
          note: String(row.Note ?? '').trim(),
        }));

        const valid = rows.filter(
          (r) => r.question || r.answer || r.note || r.no
        );

        if (valid.length === 0) {
          throw new Error('CSV に有効な問題データが含まれていません。');
        }

        resolve(valid);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました。'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}
