const fs = require('fs');

const data = fs.readFileSync('src/app/dashboard/editor/submissions/[id]/page.tsx', 'utf8');
const lines = data.split('\n');

let openCount = 0;
let closeCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    openCount += opens;
    closeCount += closes;
    if (openCount < closeCount) {
        console.log(`Mismatch at line ${i+1}: open ${openCount}, close ${closeCount}`);
        break;
    }
}
console.log(`Final: open ${openCount}, close ${closeCount}`);

// Try parsing with acorn-jsx to find exact error
try {
    const acorn = require('acorn');
    const jsx = require('acorn-jsx');
    const parser = acorn.Parser.extend(jsx());
    parser.parse(data, { ecmaVersion: 2020, sourceType: 'module' });
    console.log("Acorn parse success!");
} catch(e) {
    console.log("Acorn parse error:", e.message, "at line", e.loc ? e.loc.line : 'unknown');
}
