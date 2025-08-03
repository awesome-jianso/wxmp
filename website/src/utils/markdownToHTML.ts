import { VFile } from 'vfile';
import { unified } from 'unified';
import * as csstree from 'css-tree';
import { Element } from 'hast';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import remarkMath from 'remark-math';
import rehypePrism from 'rehype-prism-plus';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Ensure KaTeX styles are included
import rehypeRaw from 'rehype-raw';
import rehypeAttrs from 'rehype-attr';
import rehypeIgnore from 'rehype-ignore';
import rehypeRewrite from 'rehype-rewrite';
import stringify from 'rehype-stringify';
import { cssdata, spaceEscape, footnotes, footnotesLabel, imagesStyle } from './css';

export type MarkdownToHTMLOptions = {
  preColor?: string;
  previewTheme?: string;
};

export function markdownToHTML(md: string, css: string, opts: MarkdownToHTMLOptions = {}) {
  const ast = csstree.parse(css, {
    parseAtrulePrelude: false,
    parseRulePrelude: false,
    parseValue: false,
    parseCustomProperty: false,
    positions: false,
  });

  // @ts-ignore
  const data = cssdata(ast.children.head, {}, { color: opts.preColor, theme: opts.previewTheme });
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypePrism, {
      ignoreMissing: true,
    })
    .use(rehypeIgnore, {})
    .use(rehypeAttrs, { properties: 'attr' })
    .use(rehypeRewrite, {
      rewrite: (node, _index, parent) => {
        if (
          node?.type === 'element' &&
          node?.tagName === 'code' &&
          parent?.type === 'element' &&
          parent?.tagName === 'pre'
        ) {
          spaceEscape(node);
        }
        if (
          node?.type === 'element' &&
          node.tagName === 'section' &&
          (node?.properties?.className as string[]).includes('footnotes')
        ) {
          footnotes(node);
        }
        if (node?.type === 'element' && node.tagName === 'sup') {
          footnotesLabel(node);
        }
        if (node?.type === 'element' && node.tagName === 'img') {
          imagesStyle(node, parent);
        }
        // Code Spans style
        if (
          node?.type === 'element' &&
          node?.tagName === 'code' &&
          parent?.type === 'element' &&
          parent?.tagName !== 'pre'
        ) {
          if (!node.properties) node.properties = {};
          node.properties!.className = ['code-spans'];
        }
        // List TODO style
        if (parent?.type === 'element' && node?.type === 'element' && node?.tagName === 'input') {
          if (parent && parent.type === 'element') {
            parent.children = parent?.children.filter((elm) => (elm as Element).tagName !== 'input');
          }
          return;
        }
        // Support *.md.css
        if (node?.type === 'element') {
          if (!node.properties) {
            node.properties = {};
          }
          const className = node.properties?.className as string[];
          let style = '';
          if (className) {
            className.forEach((name) => {
              if (data[`.${name}`]) {
                style = data[`.${name}`];
              }
            });
          }
          if (!style) style = data[node.tagName];
          if (style) {
            node.properties.style = style + (node.properties.style || '');
          }
        }
      },
    })
    .use(stringify);
  const file = new VFile();
  file.value = md;
  const hastNode = processor.runSync(processor.parse(file), file);
  return String(processor.stringify(hastNode, file));
}
