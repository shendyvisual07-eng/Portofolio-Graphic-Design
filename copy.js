const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ggcli\\AppData\\Local\\Temp\\claude\\cdb59361332d4db6\\cb9f4c92-bd67-48cb-9e35-e7098c7f4e89\\images';
const targetDir = path.join(__dirname, 'assets');
const clientsDir = path.join(targetDir, 'clients');

if (!fs.existsSync(clientsDir)) {
  fs.mkdirSync(clientsDir, { recursive: true });
}

fs.copyFileSync(path.join(srcDir, '1.jpg'), path.join(clientsDir, 'naraya.jpg'));
fs.copyFileSync(path.join(srcDir, '2.jpg'), path.join(clientsDir, 'verona.jpg'));
fs.copyFileSync(path.join(srcDir, '3.jpg'), path.join(clientsDir, 'isabel.jpg'));
fs.copyFileSync(path.join(srcDir, '4.jpg'), path.join(targetDir, 'shendy_profile.jpg'));

console.log('Successfully copied assets');
