import archiver from "archiver";
import fs from "fs";
import path from "path";
import { ScrapedData } from "./web-scraper";

export class ZipGenerator {
  async createZip(scrapedData: ScrapedData, originalUrl: string): Promise<string> {
    const siteName = new URL(originalUrl).hostname.replace(/\./g, '-');
    const outputDir = path.join(process.cwd(), 'temp');
    const zipPath = path.join(outputDir, `${siteName}-${Date.now()}.zip`);

    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`ZIP created: ${zipPath} (${archive.pointer()} bytes)`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add main HTML file
      archive.append(scrapedData.mainHtml, { name: `${siteName}/index.html` });

      // Add all resources
      for (const resource of scrapedData.resources) {
        if (resource.content) {
          archive.append(resource.content, { 
            name: `${siteName}/${resource.path}` 
          });
        }
      }

      // Create a simple README
      const readme = `# ${siteName} - Cloned Website

This website was cloned from: ${originalUrl}
Clone date: ${new Date().toISOString()}

## Structure:
- index.html - Main website file
- assets/ - All website resources
  - css/ - Stylesheets
  - js/ - JavaScript files
  - images/ - Images
  - fonts/ - Font files

## Usage:
Open index.html in your web browser to view the cloned website.

Note: Some functionality may be limited in offline mode.
`;

      archive.append(readme, { name: `${siteName}/README.md` });

      archive.finalize();
    });
  }
}
