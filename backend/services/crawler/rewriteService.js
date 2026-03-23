const config = require('./config');

/**
 * Rewrite article content using Ollama AI.
 * Translates to Vietnamese, optimizes for SEO, outputs Markdown.
 */

/**
 * Call Ollama API to generate text
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} Generated text response
 */
async function callOllama(prompt) {
    try {
        const response = await fetch(`${config.ollama.host}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.ollama.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 4096,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || '';
    } catch (error) {
        console.error('[Rewrite] Ollama API error:', error.message);
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
 * Rewrite an article using Ollama AI
 * @param {object} article - Raw article { headline, articleBody, images, metadata, sourceUrl }
 * @returns {Promise<object>} Rewritten article { title, content, description, slug, thumbnailUrl }
 */
async function rewriteArticle(article) {
    console.log(`[Rewrite] Processing: "${article.headline}"`);

    // Step 1: Rewrite the full article content
    const rewritePrompt = `Bạn là một chuyên gia viết blog công nghệ. Hãy viết lại bài báo sau bằng tiếng Việt với văn phong lôi cuốn, dễ hiểu. Tối ưu SEO cho các từ khóa chính. Định dạng đầu ra là Markdown.

Tiêu đề gốc: ${article.headline}

Nội dung gốc:
${article.articleBody}

Yêu cầu:
- Viết lại hoàn toàn bằng tiếng Việt, không dịch máy
- Giữ nguyên thông tin kỹ thuật chính xác
- Thêm heading (##, ###) để chia đoạn rõ ràng
- Văn phong tự nhiên, hấp dẫn, dễ đọc
- Tối ưu SEO: sử dụng từ khóa chính trong heading và đoạn mở đầu
- Không thêm thông tin sai lệch
- Chỉ trả về nội dung Markdown, không thêm bất kỳ giải thích nào khác`;

    const rewrittenContent = await callOllama(rewritePrompt);

    // Step 2: Generate Vietnamese title
    const titlePrompt = `Hãy viết lại tiêu đề sau bằng tiếng Việt, ngắn gọn, hấp dẫn, tối ưu SEO. Chỉ trả về tiêu đề, không thêm gì khác.

Tiêu đề gốc: ${article.headline}`;

    const rewrittenTitle = (await callOllama(titlePrompt)).trim().replace(/^["']|["']$/g, '');

    // Step 3: Generate SEO description (~160 characters)
    const descPrompt = `Tóm tắt bài viết sau thành MỘT đoạn mô tả SEO meta description bằng tiếng Việt, tối đa 160 ký tự. Chỉ trả về đoạn mô tả, không thêm gì khác.

Tiêu đề: ${rewrittenTitle}

Nội dung:
${rewrittenContent.substring(0, 1000)}`;

    let description = (await callOllama(descPrompt)).trim().replace(/^["']|["']$/g, '');
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
    console.log(`[Rewrite] Rewriting ${articles.length} articles...`);
    const rewritten = [];

    for (const article of articles) {
        try {
            const result = await rewriteArticle(article);
            rewritten.push(result);
        } catch (error) {
            console.error(`[Rewrite] Failed to rewrite "${article.headline}":`, error.message);
            // Continue with other articles
        }
    }

    console.log(`[Rewrite] Successfully rewritten: ${rewritten.length}/${articles.length}`);
    return rewritten;
}

module.exports = { rewriteArticle, rewriteAllArticles, generateSlug };
