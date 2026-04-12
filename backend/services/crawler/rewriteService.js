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

/**
 * Rewrite an article using GitHub Copilot
 * @param {object} article - Raw article { headline, articleBody, images, metadata, sourceUrl }
 * @returns {Promise<object>} Rewritten article { title, content, description, slug, thumbnailUrl }
 */
async function rewriteArticle(article) {
    console.log(`[Rewrite] Processing: "${article.headline}"`);

    const systemPrompt = `Bạn là một biên tập viên blog công nghệ cao cấp tại Việt Nam. Nhiệm vụ của bạn là viết lại các bài báo công nghệ tiếng Anh thành bài blog tiếng Việt chi tiết, cuốn hút, giàu thông tin, và tối ưu SEO. Ưu tiên tính chính xác kỹ thuật, tính dễ đọc, và khả năng giữ chân người đọc đến cuối bài.`;

    // Step 1: Rewrite the full article content
    const rewritePrompt = `Hãy viết lại bài báo sau bằng tiếng Việt theo phong cách blog công nghệ chuyên sâu, hấp dẫn. Định dạng đầu ra là HTML.

Tiêu đề gốc: ${article.headline}

Nội dung gốc:
${article.articleBody}

Yêu cầu bắt buộc:
- Viết lại hoàn toàn bằng tiếng Việt tự nhiên, không dịch word-by-word
- Giữ nguyên đầy đủ thông tin kỹ thuật quan trọng, KHÔNG rút gọn quá mức
- Bài viết phải đủ độ sâu, tối thiểu khoảng 1200 từ (nếu dữ liệu nguồn đủ)
- Mở bài có hook mạnh: nêu vấn đề, bối cảnh, và lý do người đọc nên quan tâm
- Triển khai nội dung thành nhiều phần rõ ràng bằng <h2>/<h3>, mỗi phần có giải thích chi tiết + ví dụ thực tế
- Thêm các điểm thu hút người đọc: so sánh, tình huống sử dụng, tác động thực tế, ưu/nhược điểm, góc nhìn chuyên gia
- Khi phù hợp, dùng <ul>/<li> để tóm tắt nhanh các ý quan trọng
- Có phần “Điểm mấu chốt” gần cuối bài (dùng <h2>) để recap nhanh các ý chính
- Có đoạn kết tự nhiên, gợi mở xu hướng tương lai hoặc câu hỏi thảo luận
- Tối ưu SEO: đưa từ khóa chính vào tiêu đề phụ và đoạn mở đầu một cách tự nhiên
- Dùng HTML tags: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <blockquote>
- Không thêm thông tin sai lệch hoặc bịa nguồn
- Chỉ trả về nội dung HTML, không wrap trong \`\`\`html\`\`\` code block, không thêm <html>, <head>, <body> tags`;

    let rewrittenContent = await callOpenClaw(`${systemPrompt}

${rewritePrompt}`);

    // Generate category from content
    const categoryPrompt = `Dựa vào nội dung bài viết dưới đây, hãy phân loại nó vào MỘT trong các danh mục sau: "Học Tập", "Thủ Thuật", "Kể Chuyện", "Tin Tức". Chỉ trả về tên danh mục duy nhất, không giải thích.
    Tiêu đề: ${article.headline}`;
    
    const suggestedCategory = (await callOpenClaw(`${systemPrompt}\n\n${categoryPrompt}`)).trim();
    article.sourceCategory = suggestedCategory;
    

    // Clean up content: remove code block wrappers if present
    rewrittenContent = rewrittenContent
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    // If content is still too short, request a deeper expanded rewrite
    if (rewrittenContent.length < 3500 && (article.articleBody || '').length > 800) {
        console.log('[Rewrite] Content hơi ngắn, yêu cầu mở rộng thêm chi tiết...');
        const expandPrompt = `Bản nháp dưới đây còn hơi ngắn. Hãy mở rộng thành bài blog chi tiết, cuốn hút hơn, giữ nguyên tính chính xác kỹ thuật.

Yêu cầu mở rộng:
- Bổ sung phân tích sâu hơn cho từng ý chính
- Thêm ví dụ thực tế, so sánh, và ngữ cảnh áp dụng
- Tăng độ mạch lạc giữa các đoạn (transition tự nhiên)
- Giữ định dạng HTML sạch
- Không lặp ý, không lan man, không bịa thông tin

Bản nháp hiện tại:
${rewrittenContent}

Nguồn tham chiếu:
Tiêu đề gốc: ${article.headline}
Nội dung gốc:
${article.articleBody}`;

        rewrittenContent = await callOpenClaw(`${systemPrompt}\n\n${expandPrompt}`);
        rewrittenContent = rewrittenContent
            .replace(/^```html\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
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
