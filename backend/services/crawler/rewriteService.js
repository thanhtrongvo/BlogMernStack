const config = require('./config');

/**
 * Rewrite article content using Ollama with model fallback.
 */

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isLimitLikeError(error) {
    const msg = (error?.message || '').toLowerCase();
    return (
        msg.includes('429') ||
        msg.includes('rate limit') ||
        msg.includes('quota') ||
        msg.includes('too many requests') ||
        msg.includes('overloaded') ||
        msg.includes('capacity') ||
        msg.includes('temporarily unavailable') ||
        msg.includes('timeout')
    );
}

async function callOllama(prompt, model) {
    const response = await fetch(`${config.ollama.host}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: {
                temperature: config.ollama.temperature,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama error (${model}): ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data?.response?.trim() || '';
    if (!text) {
        throw new Error(`Ollama error (${model}): empty response`);
    }

    return text;
}

/**
 * Call rewrite model with primary+fallback strategy
 * Primary: gemma4:31b-cloud
 * Fallback on limit/capacity: gemma4:e4b (local)
 */
async function callOpenClaw(prompt) {
    const primary = config.ollama.primaryModel;
    const fallback = config.ollama.fallbackModel;

    try {
        return await callOllama(prompt, primary);
    } catch (error) {
        console.error(`[Rewrite] Primary model failed (${primary}):`, error.message);

        if (fallback && fallback !== primary && isLimitLikeError(error)) {
            console.log(`[Rewrite] Fallback to local model: ${fallback}`);
            try {
                return await callOllama(prompt, fallback);
            } catch (fallbackError) {
                console.error(`[Rewrite] Fallback model failed (${fallback}):`, fallbackError.message);
                throw fallbackError;
            }
        }

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

function looksLikeHtml(content) {
    return /<\/?(h1|h2|h3|h4|h5|h6|p|ul|ol|li|blockquote|strong|em|code|a)\b/i.test(content || '');
}

function looksLikeMarkdown(content) {
    return /(^|\n)#{1,6}\s|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|(^|\n)\s*[-*+]\s+|(^|\n)\s*\d+\.\s+/m.test(content || '');
}

function escapeHtml(text) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderInlineMarkdown(text) {
    let s = escapeHtml(text || '');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
}

function markdownToHtml(markdown) {
    const lines = (markdown || '').replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let paragraph = [];
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) {
            out.push('</ul>');
            inUl = false;
        }
        if (inOl) {
            out.push('</ol>');
            inOl = false;
        }
    };

    const flushParagraph = () => {
        if (paragraph.length) {
            out.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
            paragraph = [];
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            flushParagraph();
            closeLists();
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            flushParagraph();
            closeLists();
            const level = heading[1].length;
            out.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
            continue;
        }

        if (/^---+$/.test(line)) {
            flushParagraph();
            closeLists();
            out.push('<hr/>');
            continue;
        }

        const ul = line.match(/^[-*+]\s+(.+)$/);
        if (ul) {
            flushParagraph();
            if (inOl) {
                out.push('</ol>');
                inOl = false;
            }
            if (!inUl) {
                out.push('<ul>');
                inUl = true;
            }
            out.push(`<li>${renderInlineMarkdown(ul[1])}</li>`);
            continue;
        }

        const ol = line.match(/^\d+\.\s+(.+)$/);
        if (ol) {
            flushParagraph();
            if (inUl) {
                out.push('</ul>');
                inUl = false;
            }
            if (!inOl) {
                out.push('<ol>');
                inOl = true;
            }
            out.push(`<li>${renderInlineMarkdown(ol[1])}</li>`);
            continue;
        }

        const block = line.match(/^>\s?(.+)$/);
        if (block) {
            flushParagraph();
            closeLists();
            out.push(`<blockquote><p>${renderInlineMarkdown(block[1])}</p></blockquote>`);
            continue;
        }

        closeLists();
        paragraph.push(line);
    }

    flushParagraph();
    closeLists();

    return out.join('\n').trim();
}

function sanitizeHtmlArtifacts(content) {
    return (content || '')
        .replace(/```+/g, '')
        .replace(/[─-]{8,}/g, '')
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/<p>\s*[─-]{8,}\s*<\/p>/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function convertPipeParagraphsToTables(html) {
    const paragraphPipePattern = /<p>\s*\|([\s\S]*?)<\/p>/gi;

    return (html || '').replace(paragraphPipePattern, (full, inner) => {
        const raw = `|${inner}`;
        let tokens = raw
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
            .filter((s) => !/^[:\-\s]+$/.test(s));

        if (tokens.length < 8) return full;

        let cols = 4;
        let strongCount = 0;
        for (const t of tokens) {
            if (/<\/?(strong|b)>/i.test(t)) strongCount++;
            else break;
        }

        if (strongCount >= 2 && strongCount <= 6) {
            cols = strongCount;
        } else {
            for (const c of [4, 5, 3, 6, 2]) {
                if (tokens.length >= c * 2 && (tokens.length - c) % c === 0) {
                    cols = c;
                    break;
                }
            }
        }

        const header = tokens.slice(0, cols);
        let body = tokens.slice(cols);
        while (body.length % cols !== 0) body.pop();
        if (!header.length || !body.length) return full;

        const thead = `<thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;
        const rows = [];
        for (let i = 0; i < body.length; i += cols) {
            const cells = body.slice(i, i + cols);
            rows.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`);
        }

        return `<table>${thead}<tbody>${rows.join('')}</tbody></table>`;
    });
}

function normalizeGeneratedContent(content) {
    const cleaned = cleanHtmlOutput(content);
    if (!cleaned) return '';

    if (looksLikeHtml(cleaned)) {
        return sanitizeHtmlArtifacts(convertPipeParagraphsToTables(cleaned));
    }
    if (looksLikeMarkdown(cleaned)) {
        return sanitizeHtmlArtifacts(convertPipeParagraphsToTables(markdownToHtml(cleaned)));
    }

    return sanitizeHtmlArtifacts(convertPipeParagraphsToTables(`<p>${renderInlineMarkdown(cleaned)}</p>`));
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

function safeJsonParse(maybeJson) {
    try {
        return JSON.parse(maybeJson);
    } catch {
        const match = (maybeJson || '').match(/\{[\s\S]*\}$/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch {
            return null;
        }
    }
}

function normalizeForMatch(text) {
    return (text || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
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
    rewrittenContent = normalizeGeneratedContent(rewrittenContent);

    // If content is too short relative to source, ask for fuller coverage without hallucination
    const sourceLen = (article.articleBody || '').length;
    const ratioFloor = securityNewsMode && sourceLen > 3000 ? 0.98 : 0.9;
    const absoluteMinLen = sourceLen > 9000 ? 9000
        : sourceLen > 6000 ? 7000
        : sourceLen > 3500 ? 5500
        : sourceLen > 2000 ? 4200
        : 3000;

    const minTargetLen = Math.max(
        absoluteMinLen,
        Math.floor(sourceLen * ratioFloor)
    );

    if (rewrittenContent.length < minTargetLen && sourceLen > 1200) {
        const maxExpandAttempts = sourceLen > 2000 ? 2 : 1;

        for (let attempt = 1; attempt <= maxExpandAttempts && rewrittenContent.length < minTargetLen; attempt++) {
            console.log(`[Rewrite] Content còn ngắn (${rewrittenContent.length}), mở rộng lần ${attempt}/${maxExpandAttempts} (target ~${minTargetLen}, floor ${ratioFloor})...`);
            const expandPrompt = `Bản nháp hiện tại chưa bao quát đủ ý từ nguồn. Hãy viết lại BẢN MỚI đầy đủ hơn, vẫn bám sát nguồn.

Mục tiêu độ dài:
- Ít nhất khoảng ${minTargetLen} ký tự nội dung HTML (không độn chữ vô nghĩa).

Ràng buộc:
- Không thêm thông tin ngoài nguồn.
- Không lặp ý để câu chữ dài giả tạo.
- Mỗi ý quan trọng trong nguồn cần xuất hiện rõ trong bản viết lại.
- Ưu tiên tăng chiều sâu giải thích thay vì thêm “văn hoa”.
- Giữ HTML sạch, dễ đọc.
${securityNewsMode ? '- Đây là bài Security/News: bắt buộc giữ đủ phần kỹ thuật (CVE/phiên bản bị ảnh hưởng, cách tấn công, tác động, IOC/khuyến nghị nếu nguồn có), không bỏ ý quan trọng.' : '- Bài không thuộc security/news: bổ sung ngữ cảnh, ví dụ ứng dụng và phân tích lợi-hại để tăng chiều sâu.'}

Tiêu đề: ${article.headline}
Nội dung nguồn:
${article.articleBody}`;

            rewrittenContent = await callOpenClaw(`${systemPrompt}\n\n${expandPrompt}`);
            rewrittenContent = normalizeGeneratedContent(rewrittenContent);
        }
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
        rewrittenContent = normalizeGeneratedContent(rewrittenContent);
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
            rewrittenContent = normalizeGeneratedContent(rewrittenContent);
        }
    }

    // Round 4: checklist-driven coverage control + targeted patch pass
    if (securityNewsMode && sourceLen > 3000) {
        const checklistPrompt = `Phân tích nguồn dưới đây và trả về JSON thuần (không markdown) theo schema:
{
  "must_have": {
    "cves": ["..."],
    "versions": ["..."],
    "entities": ["vendor/product/actor quan trọng"],
    "key_points": ["ý kỹ thuật quan trọng phải có trong bài"]
  }
}

Yêu cầu:
- Chỉ trích xuất thông tin có trong nguồn.
- Giữ danh sách ngắn gọn, ưu tiên tín hiệu kỹ thuật quan trọng.
- Không thêm giải thích ngoài JSON.

Nguồn:
${article.articleBody}`;

        const checklistRaw = await callOpenClaw(`${systemPrompt}\n\n${checklistPrompt}`);
        const checklist = safeJsonParse(checklistRaw) || { must_have: { cves: [], versions: [], entities: [], key_points: [] } };

        const mustHave = checklist.must_have || {};
        const cves = toArray(mustHave.cves).map((x) => x.toString().toUpperCase());
        const versions = toArray(mustHave.versions).map((x) => x.toString());
        const entities = toArray(mustHave.entities).map((x) => x.toString());
        const keyPoints = toArray(mustHave.key_points).map((x) => x.toString());

        const outNorm = normalizeForMatch(rewrittenContent);
        const missingCves = cves.filter((x) => !outNorm.includes(normalizeForMatch(x)));
        const missingVersions = versions.filter((x) => !outNorm.includes(normalizeForMatch(x)));
        const missingEntities = entities.filter((x) => !outNorm.includes(normalizeForMatch(x)));

        // Key points are fuzzy, keep limited strictness to avoid over-trigger
        const missingKeyPoints = keyPoints.filter((kp) => !outNorm.includes(normalizeForMatch(kp).slice(0, 40)));

        const shouldPatch =
            missingCves.length > 0 ||
            missingVersions.length > 1 ||
            missingEntities.length > 2 ||
            missingKeyPoints.length > 2 ||
            rewrittenContent.length < Math.floor(sourceLen * 0.95);

        if (shouldPatch) {
            console.log(`[Rewrite] Round4 patch pass: missing CVE=${missingCves.length}, versions=${missingVersions.length}, entities=${missingEntities.length}, keyPoints=${missingKeyPoints.length}`);

            const patchPrompt = `Bạn sẽ CHỈ chỉnh sửa/bổ sung bài HTML hiện tại để đảm bảo bao phủ đầy đủ thông tin kỹ thuật bắt buộc.

CHECKLIST BẮT BUỘC:
- CVE: ${JSON.stringify(cves)}
- Versions: ${JSON.stringify(versions)}
- Entities: ${JSON.stringify(entities)}
- Key points: ${JSON.stringify(keyPoints)}

Yêu cầu:
- Giữ văn phong tự nhiên, không bịa dữ kiện ngoài nguồn.
- Ưu tiên bổ sung phần thiếu, hạn chế viết lại toàn bộ.
- Đảm bảo bài sau chỉnh sửa có độ phủ cao và gần bằng độ dài nguồn (>=95% nếu khả thi tự nhiên).
- Trả về HTML fragment sạch, KHÔNG <!DOCTYPE>, <html>, <head>, <body>.

Nguồn tham chiếu:
${article.articleBody}

Bài hiện tại cần patch:
${rewrittenContent}`;

            rewrittenContent = await callOpenClaw(`${systemPrompt}\n\n${patchPrompt}`);
            rewrittenContent = normalizeGeneratedContent(rewrittenContent);
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
    console.log(`[Rewrite] Rewriting ${articles.length} articles using Ollama primary=${config.ollama.primaryModel}, fallback=${config.ollama.fallbackModel}...`);
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

module.exports = {
    rewriteArticle,
    rewriteAllArticles,
    generateSlug,
    cleanHtmlOutput,
    extractCoverageSignals,
    normalizeGeneratedContent,
    markdownToHtml,
};
