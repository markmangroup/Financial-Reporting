#!/usr/bin/env node

/**
 * Extract Document Text
 * Extracts text from DOCX and PDF files for searchability
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Project directories
const projectDirs = [
  'laurel-ag-proposal-tools',
  'metropolitan-current-state',
  'dittmar-ap-automation',
  'braindead-portal',
  'markman-internal'
];

const categories = ['contracts', 'proposals', 'deliverables', 'documentation'];

/**
 * Extract text from DOCX file using textutil (macOS)
 */
async function extractDocx(filePath) {
  try {
    const { stdout } = await execAsync(`textutil -convert txt -stdout "${filePath}"`);
    return stdout.trim();
  } catch (error) {
    console.error(`    ❌ Failed to extract DOCX: ${error.message}`);
    return null;
  }
}

/**
 * Extract text from PDF file using pdftotext (if available)
 */
async function extractPdf(filePath) {
  try {
    // Check if pdftotext is available
    await execAsync('which pdftotext');
    const { stdout } = await execAsync(`pdftotext "${filePath}" -`);
    return stdout.trim();
  } catch (error) {
    // Fallback: use textutil on macOS
    try {
      const { stdout } = await execAsync(`textutil -convert txt -stdout "${filePath}"`);
      return stdout.trim();
    } catch (fallbackError) {
      console.error(`    ❌ Failed to extract PDF: ${fallbackError.message}`);
      return null;
    }
  }
}

/**
 * Extract text from XLSX file (just get sheet names for now)
 */
async function extractXlsx(filePath) {
  // For now, just return metadata - full extraction would need xlsx library
  return `[Excel file: ${path.basename(filePath)}]`;
}

/**
 * Extract text from PPTX file using textutil
 */
async function extractPptx(filePath) {
  try {
    const { stdout } = await execAsync(`textutil -convert txt -stdout "${filePath}"`);
    return stdout.trim();
  } catch (error) {
    console.error(`    ❌ Failed to extract PPTX: ${error.message}`);
    return null;
  }
}

/**
 * Extract text based on file extension
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.docx':
      return await extractDocx(filePath);
    case '.pdf':
      return await extractPdf(filePath);
    case '.xlsx':
      return await extractXlsx(filePath);
    case '.pptx':
      return await extractPptx(filePath);
    default:
      return null;
  }
}

/**
 * Main extraction process
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('DOCUMENT TEXT EXTRACTION');
  console.log('Extracting searchable text from project documents');
  console.log('='.repeat(80) + '\n');

  let totalProcessed = 0;
  let totalExtracted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const projectId of projectDirs) {
    const projectPath = `./data/projects/${projectId}`;
    const metadataPath = path.join(projectPath, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      console.log(`⚠️  Skipping ${projectId} - no metadata found`);
      continue;
    }

    console.log(`\n📁 Processing: ${projectId}`);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    for (const category of categories) {
      const documents = metadata.documents[category];

      if (!documents || documents.length === 0) {
        continue;
      }

      console.log(`\n  📂 ${category}: ${documents.length} files`);

      for (const doc of documents) {
        totalProcessed++;

        // Skip if already has extracted text
        if (doc.extractedText) {
          console.log(`    ℹ️  ${doc.filename} - already extracted`);
          totalSkipped++;
          continue;
        }

        console.log(`    📄 ${doc.filename}`);

        const text = await extractText(doc.localPath);

        if (text && text.length > 0) {
          // Store first 5000 characters of extracted text
          doc.extractedText = text.substring(0, 5000);
          doc.extractedTextLength = text.length;
          doc.textExtractedAt = new Date().toISOString();

          console.log(`       ✅ Extracted ${text.length} characters`);
          totalExtracted++;
        } else {
          console.log(`       ⚠️  No text extracted`);
          totalFailed++;
        }
      }
    }

    // Save updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n  💾 Metadata updated for ${projectId}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('EXTRACTION SUMMARY');
  console.log('='.repeat(80));
  console.log(`📊 Total files processed: ${totalProcessed}`);
  console.log(`✅ Successfully extracted: ${totalExtracted}`);
  console.log(`ℹ️  Skipped (already done): ${totalSkipped}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log('');
}

main().catch(console.error);
