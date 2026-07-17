const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'data', 'resourcesData.js');
let content = fs.readFileSync(filePath, 'utf-8');
content = content.replace(/\\n/g, '\n');
fs.writeFileSync(filePath, content);
console.log('Fixed literal newlines');
