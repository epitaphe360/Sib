import fs from 'fs';
import path from 'path';

const searchAndReplace = [
  // French
  { regex: /\bSalon International des Ports\b/gi, replacement: "Salon International du Bâtiment" },
  { regex: /\bLogistique Maritime\b/gi, replacement: "Secteur de la Construction" },
  { regex: /\bsolutions portuaires\b/gi, replacement: "solutions de construction" },
  { regex: /\bexpert en solutions portuaires\b/gi, replacement: "expert en bâtiment" },
  { regex: /\bsiports\b/gi, replacement: "sib" },
  { regex: /\bSIPORTS\b/g, replacement: "SIB" },
  { regex: /\bport\b/g, replacement: "bâtiment" },
  { regex: /\bPort\b/g, replacement: "Bâtiment" },
  { regex: /\bports\b/g, replacement: "bâtiments" },
  { regex: /\bPorts\b/g, replacement: "Bâtiments" },
  { regex: /\bportuaire\b/gi, replacement: "de la construction" },
  { regex: /\bmaritime\b/gi, replacement: "du BTP" },
  { regex: /\bmaritimes\b/gi, replacement: "du BTP" },
  { regex: /\bnavire\b/gi, replacement: "chantier" },
  { regex: /\bnavires\b/gi, replacement: "chantiers" },
  // Exclude some things if needed like "viewport" or "export"
];

function processFile(filePath) {
  if (filePath.includes('node_modules') || filePath.includes('.git') || !filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.html') && !filePath.endsWith('.json')) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Protect certain JS keywords
  content = content.replace(/export/g, 'EX_PORT_TMP');
  content = content.replace(/import/g, 'IM_PORT_TMP');
  content = content.replace(/viewport/g, 'VIEW_PORT_TMP');

  searchAndReplace.forEach(rule => {
      content = content.replace(rule.regex, rule.replacement);
  });

  content = content.replace(/EX_PORT_TMP/g, 'export');
  content = content.replace(/IM_PORT_TMP/g, 'import');
  content = content.replace(/VIEW_PORT_TMP/g, 'viewport');

  // Fix up specific weird replacements caused by "port" replacement
  content = content.replace(/Bâtimento/gi, 'Porto'); 
  content = content.replace(/bâtimentfolio/gi, 'portfolio'); 
  content = content.replace(/Bâtimentfolio/gi, 'Portfolio'); 
  content = content.replace(/supBâtiment/gi, 'support');
  content = content.replace(/reBâtiment/gi, 'report');
  content = content.replace(/ReBâtiment/gi, 'Report');
  content = content.replace(/transBâtiment/gi, 'transport');
  content = content.replace(/TransBâtiment/gi, 'Transport');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'src'));
walkDir(path.join(process.cwd(), 'public'));
processFile(path.join(process.cwd(), 'index.html'));

console.log("Done replacing port/maritime text!");
