const config = require('./config');

/**
 * Rewrite article content using OpenClaw OpenAI-compatible endpoint.
 */

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call OpenClaw Chat Completions API
 * @param {string} prompt - Prompt content
 * @returns {Promise<string>} Generated response
 */
async function callOpenClaw(prompt) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (config.openclaw.token) {
            headers.Authorization = `Bearer ${config.openclaw.token}`;
        }

        if (config.openclaw.backendModel) {
            headers['x-openclaw-model'] = config.openclaw.backendModel;
        }

        const response = await fetch(`${config.openclaw.host}/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: config.openclaw.model,
                stream: false,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenClaw API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
        console.error('[Rewrite] OpenClaw API error:', error.message);
        throw error;
    }
}

/**
 * Generate a URL-friendly slug from a Vietnamese title
 * @param {string} title - The article title
 * @returns {string} URL-friendly slug
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
        .substring(0, 100); // Limit length
}

function isSecurityNewsArticle(article) {
    const text = `${article?.headline || ''} ${(article?.metadata?.source || '')} ${article?.sourceCategory || ''}`.toLowerCase();
    const keywords = [
        'cve', 'zero-day', '0-day', 'ransomware', 'malware', 'exploit', 'breach',
        'hacker', 'security', 'vulnerability', 'fortinet', 'adobe', 'microsoft',
        'the hacker news', 'bleepingcomputer'
    ];
    return keywords.some((k) => text.includes(k));
}

function cleanHtmlOutput(content) {
    return (content || '')
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/<!doctype[^>]*>/ig, '')
        .replace(/<html[^>]*>/ig, '')
        .replace(/<\/html>/ig, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/ig, '')
        .replace(/<body[^>]*>/ig, '')
        .replace(/<\/body>/ig, '')
        .trim();
}

function extractCoverageSignals(text) {
    const src = (text || '').toString();
    const cves = [...new Set((src.match(/CVE-\d{4}-\d{4,7}/gi) || []).map((m) => m.toUpperCase()))];

    const versionMatches = src.match(/\b\d{1,3}\.\d{1,3}(?:\.\d{1,5}){0,2}\b/g) || [];
    const versions = [...new Set(versionMatches)].slice(0, 12);

    const keyTerms = [
        'ransomware', 'malware', 'zero-day', 'exploit', 'patch', 'actively exploited',
        'uac bypass', 'dll sideloading', 'impacket', 'mimikatz', 'ioc', 'iocs'
    ];
    const terms = keyTerms.filter((t) => src.toLowerCase().includes(t));

    return { cves, versions, terms };
}

/**
 * Rewrite an article using GitHub Copilot
 * @param {object} article - Raw article { headline, articleBody, images, metadata, sourceUrl }
 * @returns {Promise<object>} Rewritten article { title, content, description, slug, thumbnailUrl }
 */
async function rewriteArticle(article) {
    console.log(`[Rewrite] Processing: "${article.headline}"`);

    const securityNewsMode = isSecurityNewsArticle(article);

    const systemPrompt = `Bạn là biên tập viên công nghệ kỳ cựu. Viết bằng tiếng Việt tự nhiên, rõ ràng, có chiều sâu, không phô trương, không “kể lể cho dài”.

Nguyên tắc bắt buộc:
- BÁM SÁT dữ kiện từ bài gốc; không bịa tình tiết, số liệu, quote, timeline.
- KHÔNG thêm ví dụ giả định nếu bài gốc không có dữ liệu hỗ trợ.
- Ưu tiên câu ngắn-vừa, dễ đọc trên mobile.
- Tránh mở bài kiểu “drama hóa” hoặc giật gân quá mức.
- Giữ giọng văn chuyên nghiệp, thực dụng, hữu ích.
${securityNewsMode ? '- Với nhóm Security/News: ưu tiên độ phủ thông tin đầy đủ, không bỏ sót IoC, timeline, affected versions, kỹ thuật tấn công/phòng vệ có trong nguồn.' : ''}`;

    // Step 1: Rewrite the full article content
    const rewritePrompt = `Viết lại bài báo sau thành bài tiếng Việt chất lượng cao, định dạng HTML.

Tiêu đề gốc: ${article.headline}

Nội dung gốc:
${article.articleBody}

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
${securityNewsMode ? '- Nếu là Security/News: phải bao phủ đầy đủ các mục có trong nguồn: tác nhân, kỹ thuật/tactic, CVE/version bị ảnh hưởng, timeline/campaign, IoC/chỉ dấu, khuyến nghị giảm thiểu.' : ''}
- Chỉ trả về HTML thuần, không code fence, không thêm <html>/<head>/<body>.`;

    let rewrittenContent = await callOpenClaw(`${systemPrompt}

${rewritePrompt}`);

    // Generate category from content
    const categoryPrompt = `Dựa vào nội dung bài viết dưới đây, hãy phân loại nó vào MỘT trong các danh mục sau: "Học Tập", "Thủ Thuật", "Kể Chuyện", "Tin Tức". Chỉ trả về tên danh mục duy nhất, không giải thích.
    Tiêu đề: ${article.headline}`;
    
    const suggestedCategory = (await callOpenClaw(`${systemPrompt}\n\n${categoryPrompt}`)).trim();
    article.sourceCategory = suggestedCategory;
    

    // Clean up content wrappers
    rewrittenContent = cleanHtmlOutput(rewrittenContent);

    // If content is too short relative to source, ask for fuller coverage without hallucination
    const sourceLen = (article.articleBody || '').length;
    const ratioFloor = securityNewsMode && sourceLen > 3000 ? 0.95 : 0.8;
    const minTargetLen = Math.max(
        sourceLen > 7000 ? 7000 : sourceLen > 3500 ? 5000 : sourceLen > 1500 ? 3200 : 1800,
        Math.floor(sourceLen * ratioFloor)
    );

    if (rewrittenContent.length < minTargetLen && sourceLen > 1200) {
        console.log(`[Rewrite] Content ngắn (${rewrittenContent.length}), yêu cầu viết lại đầy đủ hơn (target ~${minTargetLen}, floor ${ratioFloor})...`);
        const expandPrompt = `Bản nháp hiện tại chưa bao quát đủ ý từ nguồn. Hãy viết lại BẢN MỚI đầy đủ hơn, vẫn bám sát nguồn.

Ràng buộc:
- Không thêm thông tin ngoài nguồn.
- Không lặp ý để câu chữ dài giả tạo.
- Mỗi ý quan trọng trong nguồn cần xuất hiện rõ trong bản viết lại.
- Ưu tiên tăng chiều sâu giải thích thay vì thêm “văn hoa”.
- Giữ HTML sạch, dễ đọc.
${securityNewsMode ? '- Đây là bài Security/News: bắt buộc giữ đủ phần kỹ thuật (CVE/phiên bản bị ảnh hưởng, cách tấn công, tác động, IOC/khuyến nghị nếu nguồn có), không bỏ ý quan trọng.' : ''}

Nguồn gốc:
Tiêu đề: ${article.headline}
Nội dung nguồn:
${article.articleBody}`;

        rewrittenContent = await callOpenClaw(`${systemPrompt}\n\n${expandPrompt}`);
        rewrittenContent = cleanHtmlOutput(rewrittenContent);
    }

    // Safety pass for security/news: enforce ratio floor with a focused compression-avoidance rewrite
    if (securityNewsMode && sourceLen > 3000 && rewrittenContent.length < Math.floor(sourceLen * 0.95)) {
        console.log(`[Rewrite] Security/news ratio vẫn thấp (${rewrittenContent.length}/${sourceLen}), chạy pass bù độ phủ...`);
        const coveragePrompt = `Bản dưới đây vẫn thiếu độ phủ thông tin so với nguồn. Hãy viết lại phiên bản đầy đủ hơn, vẫn trung thành dữ kiện.

Mục tiêu định lượng:
- Độ dài tối thiểu khoảng 95% so với độ dài nguồn (không độn chữ vô nghĩa).

Ràng buộc:
- Không thêm dữ kiện ngoài nguồn.
- Giữ đủ các chi tiết kỹ thuật quan trọng.
- Câu văn rõ ràng, tránh sáo rỗng.
- Trả về HTML sạch.

Tiêu đề nguồn: ${article.headline}
Nguồn:
${article.articleBody}`;

        rewrittenContent = await callOpenClaw(`${systemPrompt}\n\n${coveragePrompt}`);
        rewrittenContent = cleanHtmlOutput(rewrittenContent);
    }

    // Coverage backfill pass: ensure critical technical signals are not dropped for security/news
    if (securityNewsMode && sourceLen > 3000) {
        const srcSignals = extractCoverageSignals(article.articleBody);
        const outSignals = extractCoverageSignals(rewrittenContent);

        const missingCves = srcSignals.cves.filter((cve) => !outSignals.cves.includes(cve));
        const missingTerms = srcSignals.terms.filter((term) => !outSignals.terms.includes(term));

        if (missingCves.length > 0 || missingTerms.length > 2) {
            console.log(`[Rewrite] Thiếu tín hiệu kỹ thuật (CVE thiếu: ${missingCves.length}, term thiếu: ${missingTerms.length}), chạy backfill pass...`);
            const backfillPrompt = `Bài viết hiện tại đã ổn về văn phong nhưng còn thiếu một số chi tiết kỹ thuật từ nguồn.

Yêu cầu:
- Viết lại phiên bản hoàn chỉnh hơn từ nguồn, KHÔNG bịa thông tin.
- Bắt buộc giữ đầy đủ CVE, phiên bản ảnh hưởng, kỹ thuật tấn công/phòng vệ, timeline nếu nguồn có.
- Ưu tiên độ phủ kỹ thuật thay vì rút gọn.
- Trả về HTML fragment sạch (KHÔNG <!DOCTYPE>, <html>, <head>, <body>). 

Tiêu đề nguồn: ${article.headline}
Nguồn:
${article.articleBody}`;

            rewrittenContent = await callOpenClaw(`${systemPrompt}\n\n${backfillPrompt}`);
            rewrittenContent = cleanHtmlOutput(rewrittenContent);
        }
    }

    // Step 2: Generate Vietnamese title
    const titlePrompt = `Hãy viết lại tiêu đề sau bằng tiếng Việt theo style blog công nghệ: hấp dẫn, rõ giá trị, không giật tít quá đà, tối ưu SEO. Chỉ trả về tiêu đề, không thêm gì khác.

Tiêu đề gốc: ${article.headline}`;

    const rewrittenTitle = (await callOpenClaw(`${systemPrompt}

${titlePrompt}`)).trim().replace(/^["']|["']$/g, '');

    // Step 3: Generate SEO description (~160 characters)
    const descPrompt = `Tóm tắt bài viết sau thành MỘT đoạn mô tả SEO meta description bằng tiếng Việt, tối đa 160 ký tự. Chỉ trả về đoạn mô tả, không thêm gì khác.

Tiêu đề: ${rewrittenTitle}

Nội dung:
${rewrittenContent.substring(0, 1000)}`;

    let description = (await callOpenClaw(`${systemPrompt}

${descPrompt}`)).trim().replace(/^["']|["']$/g, '');
    // Ensure description is within ~160 chars
    if (description.length > 165) {
        description = description.substring(0, 157) + '...';
    }

    // Generate slug from Vietnamese title
    const slug = generateSlug(rewrittenTitle) + '-' + Date.now().toString(36);

    // Pick thumbnail image
    const thumbnailUrl = article.images && article.images.length > 0
        ? article.images[0]
        : '';

    const result = {
        title: rewrittenTitle,
        content: rewrittenContent,
        description: description,
        slug: slug,
        thumbnailUrl: thumbnailUrl,
        sourceUrl: article.sourceUrl,
        originalHeadline: article.headline,
    };

    console.log(`[Rewrite] Done: "${rewrittenTitle}" (slug: ${slug})`);
    return result;
}

/**
 * Rewrite multiple articles
 * @param {Array} articles - Array of raw articles
 * @returns {Promise<Array>} Array of rewritten articles
 */
async function rewriteAllArticles(articles) {
    console.log(`[Rewrite] Rewriting ${articles.length} articles using OpenClaw model ${config.openclaw.model}...`);
    const rewritten = [];
    const delayBetweenArticles = 5000; // 5 seconds between articles to avoid rate limits

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        try {
            const result = await rewriteArticle(article);
            rewritten.push(result);
            
            // Add delay between articles (except for the last one)
            if (i < articles.length - 1) {
                console.log(`[Rewrite] Waiting ${delayBetweenArticles/1000}s before next article...`);
                await sleep(delayBetweenArticles);
            }
        } catch (error) {
            console.error(`[Rewrite] Failed to rewrite "${article.headline}":`, error.message);
            // Continue with other articles
        }
    }

    console.log(`[Rewrite] Successfully rewritten: ${rewritten.length}/${articles.length}`);
    return rewritten;
}

module.exports = { rewriteArticle, rewriteAllArticles, generateSlug, cleanHtmlOutput, extractCoverageSignals };
