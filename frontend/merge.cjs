const fs = require('fs');

const file = 'src/i18n/translations.js';
let content = fs.readFileSync(file, 'utf8');

// The file has structure like:
// fr: {
//   ...
//   courses_page: { ... block 1 ... },
//   ...
//   courses_page: { ... block 2 ... },
// }

// Let's use regex to find the blocks.
// We have 3 languages: fr, en, ar. For each, we find the two `courses_page: { ... },` blocks.

function mergeBlocks(langCode) {
    const langStart = content.indexOf(`${langCode}: {`);
    if (langStart === -1) return;

    const nextLangStart = content.indexOf(`\n  },`, langStart) !== -1 ? content.indexOf(`\n  },`, langStart) : content.length;

    const langSection = content.slice(langStart, nextLangStart);

    const blocks = [];
    const regex = /courses_page:\s*\{([\s\S]*?)\},/g;
    let match;
    while ((match = regex.exec(langSection)) !== null) {
        blocks.push({
            fullText: match[0],
            inner: match[1],
            index: match.index + langStart
        });
    }

    if (blocks.length === 2) {
        // Merge block 2 into block 1
        const newBlock1Inner = blocks[0].inner + blocks[1].inner;
        const newBlock1Full = `courses_page: {${newBlock1Inner}},`;

        // Replace block 2 with empty string first (to not mess up block 1's index)
        content = content.slice(0, blocks[1].index) + content.slice(blocks[1].index + blocks[1].fullText.length);
        
        // Then replace block 1 with merged block
        content = content.slice(0, blocks[0].index) + newBlock1Full + content.slice(blocks[0].index + blocks[0].fullText.length);
    }
}

mergeBlocks('fr');
mergeBlocks('en');
mergeBlocks('ar');

fs.writeFileSync(file, content, 'utf8');
console.log('Merged successfully!');
