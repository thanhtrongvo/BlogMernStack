/**
 * Utility function to convert HTML to Markdown for use with ReactMarkdown
 * This is a simple version, for production use a more robust library might be needed
 */
export function convertHtmlToMarkdown(html: string): string {
  // If content is null or undefined, return empty string
  if (!html) return '';
  
  // Check if the content is already in Markdown format
  // This is a simple heuristic, not perfect
  const markdownIndicators = ['#', '```', '**', '*', '- ', '1. ', '> ', '![', '['];
  const isLikelyMarkdown = markdownIndicators.some(indicator => html.includes(indicator));
  
  if (isLikelyMarkdown && !html.includes('<')) {
    return html;
  }
  
  // Simple HTML to Markdown conversion
  let markdown = html;
  
  // Replace common HTML tags with Markdown
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  markdown = markdown.replace(/<a href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_match, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      return `${index++}. $1\n`;
    });
  });
  
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n');
  
  // Special handling for code blocks with language
  markdown = markdown.replace(/<pre[^>]*><code\s+class="language-([^"]+)"[^>]*>(.*?)<\/code><\/pre>/gis, 
    (_match, language, content) => {
      // Unescape HTML entities in code blocks
      let code = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      
      return `\`\`\`${language}\n${code}\n\`\`\`\n`;
    }
  );
  
  // Regular code blocks without language
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, 
    (_match, content) => {
      // Unescape HTML entities in code blocks
      let code = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      
      return `\`\`\`\n${code}\n\`\`\`\n`;
    }
  );
  
  // Inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  markdown = markdown.replace(/<img src="(.*?)"[^>]*alt="(.*?)"[^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img src="(.*?)"[^>]*>/gi, '![]($1)');
  
  // Replace line breaks and paragraphs
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n');
  
  // Handle tables
  markdown = markdown.replace(/<table[^>]*>(.*?)<\/table>/gis, (_match, tableContent) => {
    let mdTable = '';
    
    // Extract header
    const headerMatch = tableContent.match(/<thead[^>]*>(.*?)<\/thead>/is);
    if (headerMatch) {
      const headerContent = headerMatch[1];
      const headers = headerContent.match(/<th[^>]*>(.*?)<\/th>/gi);
      
      if (headers) {
        // Add header row
        mdTable += '| ' + headers.map((header: string) => {
          return header.replace(/<th[^>]*>(.*?)<\/th>/i, '$1');
        }).join(' | ') + ' |\n';
        
        // Add separator row
        mdTable += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
      }
    }
    
    // Extract body
    const bodyMatch = tableContent.match(/<tbody[^>]*>(.*?)<\/tbody>/is);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1];
      const rows = bodyContent.match(/<tr[^>]*>.*?<\/tr>/gis);
      
      if (rows) {
        rows.forEach((row: string) => {
          const cells = row.match(/<td[^>]*>(.*?)<\/td>/gi);
          if (cells) {
            mdTable += '| ' + cells.map((cell: string) => {
              return cell.replace(/<td[^>]*>(.*?)<\/td>/i, '$1');
            }).join(' | ') + ' |\n';
          }
        });
      }
    }
    
    return mdTable;
  });
  
  // Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");
  
  return markdown;
}
