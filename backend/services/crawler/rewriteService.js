const config = require('./config');

/**
 * Make call to Ollama to rewrite single article
 */
async function callOllama(prompt, model) {
    const response = await fetch(`${config.ollama.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            stream: false,
            options: { temperature: 0.7, top_p: 0.9, num_predict: 4096 }
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
}

/**
 * Rewrite single article via Ollama with fallback
 */
async function rewriteArticle(article) {
    const headline = article.headline || article.title;
    const articleBody = article.articleBody || article.content;
    
    console.log(`[Rewrite] Processing: "${headline}"`);

    const systemPrompt = `Bạn là một biên tập viên blog công nghệ cao cấp tại Việt Nam. Nhiệm vụ của bạn là viết lại các bài báo công nghệ tiếng Anh thành bài blog tiếng Việt chi tiết, cuốn hút, giàu thông tin, và tối ưu SEO. Ưu tiên tính chính xác kỹ thuật, tính dễ đọc, và khả năng giữ chân người đọc đến cuối bài.`;

    const rewritePrompt = `${systemPrompt}
    
Hãy viết lại bài báo sau bằng tiếng Việt theo phong cách blog công nghệ chuyên sâu, hấp dẫn. Định dạng đầu ra là HTML. LƯU Ý QUAN TRỌNG: TIÊU ĐỀ PHẢI ĐƯỢC DỊCH SANG TIẾNG VIỆT, KHÔNG ĐƯỢC GIỮ NGUYÊN TIẾNG ANH.

Tiêu đề gốc (HÃY DỊCH SANG TIẾNG VIỆT): ${headline}

Nội dung gốc:
${articleBody}

Yêu cầu bắt buộc:
- Tiêu đề (headline) BẮT BUỘC PHẢI DỊCH SANG TIẾNG VIỆT tự nhiên, hấp dẫn, chuẩn SEO.
- Viết lại hoàn toàn bằng tiếng Việt tự nhiên, không dịch word-by-word
- Giữ nguyên đầy đủ thông tin kỹ thuật quan trọng, KHÔNG rút gọn quá mức
- Bài viết phải đủ độ sâu, tối thiểu khoảng 1200 từ (nếu dữ liệu nguồn đủ)
- Mở bài có hook mạnh: nêu vấn đề, bối cảnh, và lý do người đọc nên quan tâm
- Triển khai nội dung thành nhiều phần rõ ràng bằng <h2>/<h3>, mỗi phần có giải thích chi tiết + ví dụ thực tế
- Thêm các điểm thu hút người đọc: so sánh, tình huống sử dụng, tác động thực tế, ưu/nhược điểm, góc nhìn chuyên gia
- Khi phù hợp, dùng <ul>/<li> để tóm tắt nhanh các ý quan trọng
- CHỈ TRẢ VỀ JSON có cấu trúc sau, không kèm bất kỳ văn bản nào khác:
{
  "title": "Tiêu đề đã dịch sang tiếng Việt",
  "content": "Nội dung bài viết HTML"
}`;

    try {
        // Try primary model
        let rewrittenData = await callOllama(rewritePrompt, "gemma4:31b-cloud");
        let parsedData;
        try {
            parsedData = JSON.parse(rewrittenData);
        } catch(e) {
            // Fallback if model didn't return pure JSON
            const jsonMatch = rewrittenData.match(/\{[\s\S]*\}/);
            if(jsonMatch) {
               parsedData = JSON.parse(jsonMatch[0]);
            } else {
               throw new Error("Could not parse JSON from model output");
            }
        }
        
        return {
            title: parsedData.title || headline,
            sourceUrl: article.url || article.sourceUrl,
            source: article.source,
            content: parsedData.content || rewrittenData,
            images: article.images || [],
            sourceDate: article.sourceDate
        };
    } catch (error) {
        console.error(`[Rewrite] Primary model (gemma4:31b-cloud) failed for "${headline}": ${error.message}`);
        console.log(`[Rewrite] Retrying "${headline}" with fallback model (gemma4:e4b)...`);
        
        try {
            // Try fallback model
            let rewrittenData = await callOllama(rewritePrompt, "gemma4:e4b");
            let parsedData;
            try {
                 parsedData = JSON.parse(rewrittenData);
            } catch(e) {
                 const jsonMatch = rewrittenData.match(/\{[\s\S]*\}/);
                 if(jsonMatch) {
                    parsedData = JSON.parse(jsonMatch[0]);
                 } else {
                    throw new Error("Could not parse JSON from fallback model output");
                 }
            }
            
            return {
                title: parsedData.title || headline,
                sourceUrl: article.url || article.sourceUrl,
                source: article.source,
                content: parsedData.content || rewrittenData,
                images: article.images || [],
                sourceDate: article.sourceDate
            };
        } catch (fallbackError) {
             console.error(`[Rewrite] Fallback model (gemma4:e4b) failed for "${headline}": ${fallbackError.message}`);
             return null;
        }
    }
}

/**
 * Rewrite multiple articles
 */
async function rewriteAllArticles(articles) {
    console.log(`[Rewrite] Rewriting ${articles.length} articles using Ollama (primary: gemma4:31b-cloud, fallback: gemma4:e4b)...`);
    const rewritten = [];
    const delayBetweenArticles = 5000;

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        
        const result = await rewriteArticle(article);
        if (result) {
            rewritten.push(result);
        }

        if (i < articles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenArticles));
        }
    }

    console.log(`[Rewrite] Successfully rewritten: ${rewritten.length}/${articles.length}`);
    return rewritten;
}

module.exports = {
    rewriteAllArticles,
    rewriteArticle
};
