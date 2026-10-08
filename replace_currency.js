const fs = require('fs');
const path = require('path');

const directory = '/home/psalms/my_workspace/FullStackProjects/sales-pro/client/src';
// Recursively find js/jsx
const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walkSync(filepath, filelist);
        } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
            filelist.push(filepath);
        }
    }
    return filelist;
}

const files = walkSync(directory);
let count = 0;
for (let file of files) {
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace $ followed by digit
    if (/\$([0-9])/.test(code)) {
        code = code.replace(/\$([0-9])/g, '₦$1');
        changed = true;
    }
    // Replace $${...} (interpolated variable currency)
    if (/\$\$\{/.test(code)) {
        code = code.replace(/\$\$\{/g, '₦${');
        changed = true;
    }
    // Other specific
    if (/\(\$\/month\)/.test(code)) {
        code = code.replace(/\(\$\/month\)/g, '(₦/month)');
        changed = true;
    }
    if (/\$([A-Za-z]+)/.test(code) && code.includes('Base Salary ($/month)')) {
        // Just generic catch but mostly the above will do.
    }

    if (changed) {
        fs.writeFileSync(file, code);
        count++;
    }
}
console.log(`Updated ${count} files with Naira symbol.`);
