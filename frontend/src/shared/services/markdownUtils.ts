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

export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  return htmlTagRegex.test(content);
}

export function convertHtmlToMarkdown(html: string): string {
  if (!html) return "";
  if (!isHtmlContent(html)) return html;
  return turndownService.turndown(html);
}

export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  if (isHtmlContent(markdown)) return markdown;
  return marked.parse(markdown, { gfm: true, breaks: true }) as string;
}
