const config = require('./config');
const { marked } = require('marked');

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

/**
 * Rewrite an article using GitHub Copilot
 * @param {object} article - Raw article { headline, articleBody, images, metadata, sourceUrl }
 * @returns {Promise<object>} Rewritten article { title, content, description, slug, thumbnailUrl }
 */
async function rewriteArticle(article) {
    console.log(`[Rewrite] Processing: "${article.headline}"`);

    const systemPrompt = `Bạn là biên tập viên công nghệ kỳ cựu. Nhiệm vụ của bạn là dịch và viết lại bài báo công nghệ sang tiếng Việt một cách TƯỜNG TẬN, CHUYÊN SÂU và BẢO TOÀN TRỌN VẸN thông tin.

Nguyên tắc bắt buộc:
- BẢO TOÀN THÔNG TIN: Tuyệt đối KHÔNG được tóm tắt (summarize) hay cắt xén nội dung. Bài gốc có bao nhiêu ý, số liệu, trích dẫn, ví dụ thì phải giữ lại đầy đủ.
- BÁM SÁT CẤU TRÚC: Dịch chi tiết từng phần, từng đoạn văn, từng heading của bài gốc. Tăng cường độ sâu giải thích thay vì lướt qua.
- KHÔNG bịa tình tiết, không thêm ví dụ giả định ngoài luồng.
- Giữ giọng văn chuyên nghiệp, phân tích chuyên sâu, rõ ràng và mạch lạc.`;

    // Step 1: Rewrite the full article content
    const rewritePrompt = `Hãy viết lại bài báo sau thành một bài viết tiếng Việt CHUYÊN SÂU, CHI TIẾT và TOÀN DIỆN nhất, định dạng HTML.

Tiêu đề gốc: ${article.headline}

Nội dung gốc:
${article.articleBody}

Yêu cầu bắt buộc:
1. BẢO TOÀN TOÀN BỘ CẤU TRÚC: Phân tích và viết lại chi tiết TỪNG LUẬN ĐIỂM, TỪNG ĐOẠN VĂN từ bài gốc. Bài viết đầu ra phải có ĐỘ DÀI TƯƠNG ĐƯƠNG HOẶC DÀI HƠN bài gốc do tính chất giải thích chuyên sâu.
2. KHÔNG TÓM TẮT: Dịch chi tiết, khai thác sâu từng câu chữ, giữ nguyên toàn bộ các danh sách (bullet points), thông số kỹ thuật, trích dẫn (quote).
3. ĐỊNH DẠNG HTML CHUẨN: Sử dụng đa dạng các thẻ <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <blockquote> để bài viết sinh động, trình bày đẹp mắt.
4. Mỗi heading (<h2>, <h3>) phải rõ ràng, mang thông tin giá trị (không chung chung).
5. Giải thích cặn kẽ các thuật ngữ công nghệ nếu ngữ cảnh bài gốc có đề cập, giúp người đọc Việt Nam dễ hiểu ý nghĩa thực tiễn.
6. Chỉ trả về HTML thuần, KHÔNG dùng markdown code fence (như \`\`\`html), KHÔNG thêm <html>, <head> hay <body>.`;

    let rewrittenContentRaw = await callOpenClaw(`${systemPrompt}

${rewritePrompt}`);

    // Generate category from content
    const catSystemPrompt = `Bạn là một hệ thống phân loại tự động. BẠN CHỈ ĐƯỢC PHÉP TRẢ VỀ ĐÚNG 1 CỤM TỪ (tên danh mục), tuyệt đối không giải thích, không thêm dấu câu.`;
    const snippet = (article.articleBody || '').substring(0, 1500);
    const categoryPrompt = `Dựa vào tiêu đề và nội dung bài viết dưới đây, hãy phân loại nó vào MỘT trong các danh mục sau: "Học Tập", "Thủ Thuật", "Kể Chuyện", "Tin Tức".

Tiêu đề: ${article.headline}
Nội dung (trích đoạn): ${snippet}...

Chỉ in ra tên danh mục (ví dụ: Tin Tức):`;
    
    let suggestedCategory = (await callOpenClaw(`${catSystemPrompt}\n\n${categoryPrompt}`)).trim();
    // Dọn dẹp lỡ AI trả về có dấu nháy hoặc dấu chấm (VD: "Tin Tức" -> Tin Tức)
    suggestedCategory = suggestedCategory.replace(/['"\.]/g, '');
    console.log(`[Rewrite] AI đề xuất danh mục: ${suggestedCategory}`);
    article.sourceCategory = suggestedCategory;
    

    // Clean up content: remove code block wrappers if present
    rewrittenContentRaw = rewrittenContentRaw
        .replace(/^```html\s*/i, '')
        .replace(/^```markdown\s*/i, '')
        .replace(/^```md\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
        
    // Dùng marked để convert Markdown -> HTML nếu AI vẫn trả về Markdown
    let rewrittenContent = marked.parse(rewrittenContentRaw);

    // If content is too short relative to source, ask for fuller coverage without hallucination
    const sourceLen = (article.articleBody || '').length;
    const minTargetLen = sourceLen > 7000 ? 7000 : sourceLen > 3500 ? 5000 : sourceLen > 1500 ? 3200 : 1800;

    if (rewrittenContent.length < minTargetLen && sourceLen > 1200) {
        console.log(`[Rewrite] Content ngắn (${rewrittenContent.length}), yêu cầu viết lại đầy đủ hơn (target ~${minTargetLen})...`);
        const expandPrompt = `Bản nháp hiện tại ĐANG QUÁ NGẮN và bị mất rất nhiều thông tin từ nguồn. BẮT BUỘC PHẢI viết lại BẢN MỚI chi tiết và dài hơn, bảo toàn TRỌN VẸN bài gốc.

Ràng buộc TỐI THƯỢNG:
- PHẢI dịch chi tiết TỪNG ĐOẠN VĂN của bài gốc. Tuyệt đối KHÔNG tóm tắt.
- Toàn bộ luận điểm, số liệu, danh sách, trích dẫn từ bài gốc PHẢI có mặt trong bản viết lại này.
- Tăng cường độ sâu phân tích. Giữ HTML sạch, phân bố <h2>, <h3>, <p>, <ul> hợp lý.

Nguồn gốc:
Tiêu đề: ${article.headline}
Nội dung nguồn:
${article.articleBody}`;

        let expandedContentRaw = await callOpenClaw(`${systemPrompt}\n\n${expandPrompt}`);
        expandedContentRaw = expandedContentRaw
            .replace(/^```html\s*/i, '')
            .replace(/^```markdown\s*/i, '')
            .replace(/^```md\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        rewrittenContent = marked.parse(expandedContentRaw);
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

module.exports = { rewriteArticle, rewriteAllArticles, generateSlug };
