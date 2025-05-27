import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./features/blog/pages/BlogDetail.css";

const testMarkdown = `# Test Markdown Content

## Heading 2
### Heading 3

This is a **bold text** and this is *italic text*.

Here's a list:
- Item 1
- Item 2
- Item 3

And a numbered list:
1. First item
2. Second item
3. Third item

Here's some code:
\`\`\`javascript
function testFunction() {
  console.log("Hello, world!");
  return true;
}
\`\`\`

And inline code: \`const x = 5;\`

> This is a blockquote
> With multiple lines

[This is a link](https://example.com)

![Image alt text](https://via.placeholder.com/300x200)
`;

export function TestMarkdown() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Markdown Rendering</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Raw Markdown:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {testMarkdown}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Rendered Output:</h2>
          <div className="prose prose-lg blog-content border p-4 rounded">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children, ...props }) => {
                  const text = children?.toString() || "";
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return (
                    <h1 id={id} {...props}>
                      {children}
                    </h1>
                  );
                },
                h2: ({ children, ...props }) => {
                  const text = children?.toString() || "";
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return (
                    <h2 id={id} {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = children?.toString() || "";
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return (
                    <h3 id={id} {...props}>
                      {children}
                    </h3>
                  );
                },
                code: ({ className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const inline = !match;
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vs}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {testMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
