const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const source = fs.readFileSync(path.resolve(__dirname, './cpuid-source.txt'), 'utf8');
const headline = 'CPUID hacked to deliver malware via CPU-Z, HWMonitor downloads';

const systemPrompt = `Bạn là biên tập viên công nghệ kỳ cựu. Viết bằng tiếng Việt tự nhiên, rõ ràng, có chiều sâu, không phô trương, không “kể lể cho dài”.

Nguyên tắc bắt buộc:
- BÁM SÁT dữ kiện từ bài gốc; không bịa tình tiết, số liệu, quote, timeline.
- KHÔNG thêm ví dụ giả định nếu bài gốc không có dữ liệu hỗ trợ.
- Ưu tiên câu ngắn-vừa, dễ đọc trên mobile.
- Tránh mở bài kiểu “drama hóa” hoặc giật gân quá mức.
- Giữ giọng văn chuyên nghiệp, thực dụng, hữu ích.
- Với nhóm Security/News: ưu tiên độ phủ thông tin đầy đủ, không bỏ sót IoC, timeline, affected versions, kỹ thuật tấn công/phòng vệ có trong nguồn.`;

const rewritePrompt = `Viết lại bài báo sau thành bài tiếng Việt chất lượng cao, định dạng HTML.

Tiêu đề gốc: ${headline}

Nội dung gốc:
${source}

Yêu cầu bắt buộc:
- Viết lại tự nhiên, mạch lạc, không dịch máy móc.
- Chỉ dùng dữ kiện có trong nguồn; không tự thêm quote/số liệu/sự kiện mới.
- Ưu tiên cấu trúc rõ ràng: mở bài ngắn, thân bài theo ý chính, kết bài súc tích.
- Mỗi <h2> cần có giá trị thông tin cụ thể (không đặt tiêu đề “màu mè”).
- Có thể dùng <h3>, <ul>/<li> khi cần để tăng khả năng quét nhanh.
- Giải thích ngắn gọn “ý nghĩa thực tế” cho người đọc Việt (ảnh hưởng gì, cần làm gì).
- Độ dài mục tiêu: tương đương bài gốc; nếu nguồn ngắn thì chấp nhận bài ngắn nhưng phải đầy đủ ý.
- Tránh lặp ý, tránh kéo dài bằng câu văn chung chung.
- Dùng HTML tags: <h1>, <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <blockquote>.
- Nếu là Security/News: phải bao phủ đầy đủ các mục có trong nguồn: tác nhân, kỹ thuật/tactic, CVE/version bị ảnh hưởng, timeline/campaign, IoC/chỉ dấu, khuyến nghị giảm thiểu.
- Chỉ trả về HTML thuần, không code fence, không thêm <html>/<head>/<body>.`;

const prompt = `${systemPrompt}\n\n${rewritePrompt}`;

function stat(name, text) {
  const chars = (text || '').length;
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const hTags = (text.match(/<h[1-6]\b/gi) || []).length;
  const pTags = (text.match(/<p\b/gi) || []).length;
  console.log(`\n=== ${name} ===`);
  console.log({ chars, words, hTags, pTags });
  console.log((text || '').slice(0, 500).replace(/\n/g, ' '));
}

async function callOpenClaw() {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.OPENCLAW_TOKEN) headers.Authorization = `Bearer ${process.env.OPENCLAW_TOKEN}`;
  if (process.env.OPENCLAW_BACKEND_MODEL) headers['x-openclaw-model'] = process.env.OPENCLAW_BACKEND_MODEL;

  const r = await fetch(`${process.env.OPENCLAW_HOST || 'http://127.0.0.1:18789'}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: process.env.OPENCLAW_MODEL || 'openclaw/default',
      stream: false,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`OpenClaw ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callOllama(model) {
  const r = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0.7 }
    }),
  });
  if (!r.ok) throw new Error(`Ollama ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data?.response || '';
}

(async () => {
  try {
    console.log('Source chars:', source.length);
    const openclawText = await callOpenClaw();
    stat('OpenClaw default', openclawText);

    for (const m of ['gemma4:31b-cloud', 'qwen3-coder-next:cloud']) {
      try {
        const out = await callOllama(m);
        stat(`Ollama ${m}`, out);
      } catch (e) {
        console.error(`Failed ${m}:`, e.message);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
