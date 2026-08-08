// audit_interactive.js
// Scans the src directory for interactive JSX elements (buttons, onClick, onSubmit, clickable cards)
// Generates a JSON report listing file, line, element type, handler presence, and surrounding component.

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const SRC_DIR = path.resolve(__dirname, 'src');
const REPORT_PATH = path.resolve(__dirname, 'interactive_audit_report.json');

async function main() {
  const files = await globby(['**/*.{js,jsx,ts,tsx}'], { cwd: SRC_DIR, absolute: true });
  const report = [];

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
      });
    } catch (e) {
      console.error('Parse error in', file, e.message);
      continue;
    }
    traverse(ast, {
      JSXElement(pathNode) {
        const opening = pathNode.node.openingElement;
        const nameNode = opening.name;
        let name = '';
        if (nameNode.type === 'JSXIdentifier') {
          name = nameNode.name;
        } else if (nameNode.type === 'JSXMemberExpression') {
          name = nameNode.property.name;
        }
        const attrs = opening.attributes;
        const attrMap = {};
        attrs.forEach(attr => {
          if (attr.type === 'JSXAttribute') {
            const attrName = attr.name.name;
            if (attr.value && attr.value.type === 'JSXExpressionContainer') {
              attrMap[attrName] = attr.value.expression.type;
            } else {
              attrMap[attrName] = 'literal';
            }
          }
        });
        const hasOnClick = !!attrMap['onClick'];
        const hasOnSubmit = !!attrMap['onSubmit'];
        const isButton = name === 'button' || name === 'Button';
        const isClickableCard = name === 'Card' && (attrMap['onClick'] || attrMap['onSelect']);
        if (isButton || hasOnClick || hasOnSubmit || isClickableCard) {
          const loc = opening.loc.start;
          report.push({
            file: path.relative(process.cwd(), file),
            line: loc.line,
            element: name,
            hasOnClick,
            hasOnSubmit,
            isClickableCard,
          });
        }
      },
    });
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log('Audit report written to', REPORT_PATH);
}

main();
