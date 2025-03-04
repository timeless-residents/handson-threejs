#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// 対象ディレクトリ
const usecasesDir = path.join(__dirname, "src", "usecases");

// 修正パターン - 複数のパターンに対応
const oldPatterns = [
  /return fetch\(dataURL\)\.then\(\(res\) => res\.blob\(\)\);/g,
  /return fetch\(dataURL\)\.then\(res => res\.blob\(\)\);/g,
  /return fetch\(dataURL\)\.then\(\(response\) => response\.blob\(\)\);/g,
  /return fetch\(dataURL\)\.then\(response => response\.blob\(\)\);/g,
];
const newCode = `// 明示的に Promise を返す
    return new Promise((resolve, reject) => {
      fetch(dataURL)
        .then((response) => response.blob())
        .then((blob) => resolve(blob))
        .catch((error) => {
          console.error("Error creating thumbnail blob:", error);
          reject(error);
        });
    });`;

async function fixThumbnailMethod(filePath) {
  try {
    // ファイルを読み込む
    const content = await readFile(filePath, "utf8");

    // getThumbnailBlobメソッドがあるか確認
    if (content.includes("getThumbnailBlob")) {
      console.log(`Checking ${path.relative(__dirname, filePath)}`);

      let matched = false;
      let newContent = content;

      // 各パターンをチェック
      for (const pattern of oldPatterns) {
        if (pattern.test(newContent)) {
          console.log(`  - Found match for pattern: ${pattern}`);
          matched = true;
          newContent = newContent.replace(pattern, newCode);
        }
      }

      if (!matched) {
        console.log(`  - No matching pattern found`);
        // ファイルの内容を表示して確認
        const getThumbnailBlobMethod = content.match(
          /static getThumbnailBlob\(\)[\s\S]*?return fetch\([\s\S]*?\);/
        );
        if (getThumbnailBlobMethod) {
          console.log(
            `  - Method found: ${getThumbnailBlobMethod[0].substring(
              0,
              100
            )}...`
          );
        }
        return false;
      }

      console.log(`  - Fixing file`);

      // 変更があれば保存
      if (newContent !== content) {
        await writeFile(filePath, newContent, "utf8");
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    let fixedCount = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // usecaseディレクトリを探す
        if (file.startsWith("usecase-")) {
          const indexFile = path.join(filePath, "index.js");
          if (fs.existsSync(indexFile)) {
            const fixed = await fixThumbnailMethod(indexFile);
            if (fixed) fixedCount++;
          }
        } else {
          // 他のディレクトリは再帰的に処理
          fixedCount += await processDirectory(filePath);
        }
      }
    }

    return fixedCount;
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
    return 0;
  }
}

async function main() {
  console.log("Starting thumbnail fix script...");
  const fixedCount = await processDirectory(usecasesDir);
  console.log(`Fixed ${fixedCount} files.`);
}

main().catch(console.error);
