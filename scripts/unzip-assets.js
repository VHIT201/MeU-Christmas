const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Safe unzip: extract each zip into its own subfolder under public/assets
const assetsDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const files = fs.readdirSync(assetsDir);
files.forEach((file) => {
  if (file.toLowerCase().endsWith('.zip')) {
    try {
      const zipPath = path.join(assetsDir, file);
      const extractDirName = path.basename(file, '.zip');
      const extractTo = path.join(assetsDir, extractDirName);
      if (!fs.existsSync(extractTo)) fs.mkdirSync(extractTo, { recursive: true });
      const zip = new AdmZip(zipPath);
      // Extract only files (AdmZip doesn't sanitize paths well), so filter entries
      zip.getEntries().forEach((entry) => {
        const entryName = entry.entryName.replace(/\\/g, '/');
        // Prevent path traversal
        if (entryName.includes('..')) return;
        const targetPath = path.join(extractTo, entryName);
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        if (entry.isDirectory) return;
        fs.writeFileSync(targetPath, entry.getData());
      });
      console.log(`Extracted ${file} -> ${extractTo}`);
      // If the extracted folder contains scene.gltf, copy its contents to assets root
      const sceneFile = path.join(extractTo, 'scene.gltf');
      if (fs.existsSync(sceneFile)) {
        // copy recursively from extractTo -> assetsDir
        const copyRecursive = (src, dst) => {
          const entries = fs.readdirSync(src);
          for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const dstPath = path.join(dst, entry);
            const stat = fs.statSync(srcPath);
            if (stat.isDirectory()) {
              if (!fs.existsSync(dstPath)) fs.mkdirSync(dstPath, { recursive: true });
              copyRecursive(srcPath, dstPath);
            } else {
              fs.copyFileSync(srcPath, dstPath);
            }
          }
        };
        try {
          copyRecursive(extractTo, assetsDir);
          console.log(`Copied scene.gltf and resources from ${extractTo} to ${assetsDir}`);
        } catch (err) {
          console.error('Failed to copy scene resources', err);
        }
      }
      // optional: remove zip after extraction
      // fs.unlinkSync(zipPath);
    } catch (err) {
      console.error('Failed to extract', file, err);
    }
  }
});
