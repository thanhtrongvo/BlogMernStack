import TurndownService from "turndown";
import { marked } from "marked";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

turndownService.addRule("preCode", {
  filter: "pre",
  replacement: (_content, node) => {
    const codeNode = node.querySelector("code");
    const rawText = node.textContent || "";
    const className = codeNode?.getAttribute("class") || "";
    const languageMatch = className.match(/language-([a-z0-9]+)/i);
    const language = languageMatch ? languageMatch[1] : "";
    const codeContent = codeNode?.textContent || rawText;

    const langLine = language ? `${language}\n` : "";
    return `\n\n\`\`\`${langLine}${codeContent}\n\`\`\`\n\n`;
  },
});

const htmlTagRegex = /<([a-z][\s\S]*?)>/i;

// Regex to detect markdown syntax patterns
const markdownPatterns = /^#{1,6}\s|^\*\*|^-{3,}|^\*\s|^>\s|^\d+\.\s|```/m;

export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  return htmlTagRegex.test(content);
}

/**
 * Check if content looks like markdown wrapped in HTML tags
 * e.g., <p># Heading\n\nSome text...</p>
 */
function isMarkdownWrappedInHtml(html: string): boolean {
  if (!html) return false;

  // Check if it's a simple wrapper (single <p> or few tags containing markdown)
  const stripped = html
    .replace(/<\/?p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ");

  // Decode HTML entities
  const decoded = decodeHtmlEntities(stripped);

  // Check if the inner content has markdown patterns
  return markdownPatterns.test(decoded);
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&apos;": "'",
    "&nbsp;": " ",
    "&ndash;": "\u2013", // en dash
    "&mdash;": "\u2014", // em dash
    "&ldquo;": "\u201C", // left double quote
    "&rdquo;": "\u201D", // right double quote
    "&lsquo;": "\u2018", // left single quote
    "&rsquo;": "\u2019", // right single quote
    "&hellip;": "\u2026", // ellipsis
    "&rarr;": "\u2192", // right arrow
    "&larr;": "\u2190", // left arrow
  };

  let result = text;

  // Replace named entities
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }

  // Replace numeric entities (&#xxx; and &#xXXX;)
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  // Replace Vietnamese HTML entities
  const vietnameseEntities: Record<string, string> = {
    "&agrave;": "\u00E0", // à
    "&aacute;": "\u00E1", // á
    "&atilde;": "\u00E3", // ã
    "&acirc;": "\u00E2",  // â
    "&egrave;": "\u00E8", // è
    "&eacute;": "\u00E9", // é
    "&ecirc;": "\u00EA",  // ê
    "&igrave;": "\u00EC", // ì
    "&iacute;": "\u00ED", // í
    "&ograve;": "\u00F2", // ò
    "&oacute;": "\u00F3", // ó
    "&otilde;": "\u00F5", // õ
    "&ocirc;": "\u00F4",  // ô
    "&ugrave;": "\u00F9", // ù
    "&uacute;": "\u00FA", // ú
    "&yacute;": "\u00FD", // ý
    "&Agrave;": "\u00C0", // À
    "&Aacute;": "\u00C1", // Á
    "&Atilde;": "\u00C3", // Ã
    "&Acirc;": "\u00C2",  // Â
    "&Egrave;": "\u00C8", // È
    "&Eacute;": "\u00C9", // É
    "&Ecirc;": "\u00CA",  // Ê
    "&Igrave;": "\u00CC", // Ì
    "&Iacute;": "\u00CD", // Í
    "&Ograve;": "\u00D2", // Ò
    "&Oacute;": "\u00D3", // Ó
    "&Otilde;": "\u00D5", // Õ
    "&Ocirc;": "\u00D4",  // Ô
    "&Ugrave;": "\u00D9", // Ù
    "&Uacute;": "\u00DA", // Ú
  };

  for (const [entity, char] of Object.entries(vietnameseEntities)) {
    result = result.replace(new RegExp(entity, "g"), char);
  }

  return result;
}

/**
 * Extract markdown from HTML-wrapped content
 */
function extractMarkdownFromHtml(html: string): string {
  let result = html
    // Remove opening/closing p tags
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    // Convert br to newlines
    .replace(/<br\s*\/?>/gi, "\n")
    // Remove other simple inline tags but keep content
    .replace(/<\/?(?:span|div|strong|em|b|i)[^>]*>/gi, "");

  // Decode HTML entities
  result = decodeHtmlEntities(result);

  // Clean up extra whitespace
  result = result.replace(/\n{3,}/g, "\n\n").trim();

  return result;
}

export function convertHtmlToMarkdown(html: string): string {
  if (!html) return "";

  // If not HTML at all, return as-is (already markdown)
  if (!isHtmlContent(html)) return html;

  // Check if this is markdown wrapped in HTML (common from some editors)
  if (isMarkdownWrappedInHtml(html)) {
    return extractMarkdownFromHtml(html);
  }

  // Standard HTML to Markdown conversion
  const markdown = turndownService.turndown(html);

  // Decode any remaining HTML entities
  return decodeHtmlEntities(markdown);
}

export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  if (isHtmlContent(markdown)) return markdown;
  return marked.parse(markdown, { gfm: true, breaks: true }) as string;
}
