import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { URL } from "url";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

export interface ScrapeOptions {
  url: string;
  includeImages: boolean;
  includeFonts: boolean;
  includeJS: boolean;
  followSubdomains: boolean;
  maxDepth: number;
  onProgress?: (progress: number) => Promise<void>;
}

export interface ScrapedResource {
  url: string;
  path: string;
  content?: Buffer;
  type: 'html' | 'css' | 'js' | 'image' | 'font' | 'other';
}

export interface ScrapedData {
  baseUrl: string;
  resources: ScrapedResource[];
  mainHtml: string;
}

export class WebScraper {
  private downloadedUrls = new Set<string>();
  private resourceQueue: { url: string; type: string; depth: number }[] = [];

  async scrapeWebsite(options: ScrapeOptions): Promise<ScrapedData> {
    this.downloadedUrls.clear();
    this.resourceQueue = [];

    const baseUrl = new URL(options.url);
    const resources: ScrapedResource[] = [];
    
    // Download main HTML
    const mainHtmlResponse = await fetch(options.url);
    const mainHtml = await mainHtmlResponse.text();
    const $ = cheerio.load(mainHtml);

    // Extract and queue resources
    await this.extractResources($, baseUrl, options);

    let processedCount = 0;
    const totalResources = this.resourceQueue.length;

    // Process resource queue with progress reporting
    for (const resource of this.resourceQueue) {
      try {
        if (this.downloadedUrls.has(resource.url)) continue;

        const resourceData = await this.downloadResource(resource.url, resource.type);
        if (resourceData) {
          resources.push(resourceData);
          this.downloadedUrls.add(resource.url);
        }

        processedCount++;
        if (options.onProgress) {
          await options.onProgress(processedCount / totalResources);
        }
      } catch (error) {
        console.warn(`Failed to download resource: ${resource.url}`, error);
      }
    }

    // Convert paths in HTML to relative
    const processedHtml = this.convertPathsToRelative(mainHtml, baseUrl.origin);

    return {
      baseUrl: options.url,
      resources,
      mainHtml: processedHtml,
    };
  }

  private async extractResources($: cheerio.CheerioAPI, baseUrl: URL, options: ScrapeOptions) {
    // Extract CSS files
    $('link[rel="stylesheet"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const absoluteUrl = new URL(href, baseUrl.origin).href;
        this.resourceQueue.push({ url: absoluteUrl, type: 'css', depth: 1 });
      }
    });

    // Extract JavaScript files
    if (options.includeJS) {
      $('script[src]').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, baseUrl.origin).href;
          this.resourceQueue.push({ url: absoluteUrl, type: 'js', depth: 1 });
        }
      });
    }

    // Extract images
    if (options.includeImages) {
      $('img[src]').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, baseUrl.origin).href;
          this.resourceQueue.push({ url: absoluteUrl, type: 'image', depth: 1 });
        }
      });
    }

    // Extract fonts from CSS (basic implementation)
    if (options.includeFonts) {
      for (const resource of this.resourceQueue) {
        if (resource.type === 'css') {
          try {
            const cssResponse = await fetch(resource.url);
            const cssContent = await cssResponse.text();
            const fontUrls = this.extractFontUrls(cssContent, resource.url);
            fontUrls.forEach(fontUrl => {
              this.resourceQueue.push({ url: fontUrl, type: 'font', depth: 2 });
            });
          } catch (error) {
            console.warn(`Failed to process CSS for fonts: ${resource.url}`);
          }
        }
      }
    }
  }

  private extractFontUrls(cssContent: string, baseUrl: string): string[] {
    const fontUrls: string[] = [];
    const fontUrlRegex = /url\(['"]?([^'"]+\.(?:woff2?|ttf|otf|eot))['"]?\)/gi;
    let match;

    while ((match = fontUrlRegex.exec(cssContent)) !== null) {
      try {
        const fontUrl = new URL(match[1], baseUrl).href;
        fontUrls.push(fontUrl);
      } catch (error) {
        console.warn(`Invalid font URL: ${match[1]}`);
      }
    }

    return fontUrls;
  }

  private async downloadResource(url: string, type: string): Promise<ScrapedResource | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const content = Buffer.from(await response.arrayBuffer());
      const urlObj = new URL(url);
      const relativePath = this.generateRelativePath(urlObj, type);

      return {
        url,
        path: relativePath,
        content,
        type: type as ScrapedResource['type'],
      };
    } catch (error) {
      console.warn(`Failed to download: ${url}`, error);
      return null;
    }
  }

  private generateRelativePath(url: URL, type: string): string {
    const hostname = url.hostname.replace(/\./g, '-');
    const pathname = url.pathname;
    const filename = path.basename(pathname) || 'index.html';
    
    let folder = 'assets';
    switch (type) {
      case 'css':
        folder = 'assets/css';
        break;
      case 'js':
        folder = 'assets/js';
        break;
      case 'image':
        folder = 'assets/images';
        break;
      case 'font':
        folder = 'assets/fonts';
        break;
    }

    return path.join(folder, filename).replace(/\\/g, '/');
  }

  private convertPathsToRelative(html: string, baseUrl: string): string {
    const $ = cheerio.load(html);
    const base = new URL(baseUrl);

    // Convert CSS links
    $('link[rel="stylesheet"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const url = new URL(href, baseUrl);
          const filename = path.basename(url.pathname) || 'style.css';
          $(element).attr('href', `assets/css/${filename}`);
        } catch (error) {
          console.warn(`Failed to convert CSS path: ${href}`);
        }
      }
    });

    // Convert script sources
    $('script[src]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        try {
          const url = new URL(src, baseUrl);
          const filename = path.basename(url.pathname) || 'script.js';
          $(element).attr('src', `assets/js/${filename}`);
        } catch (error) {
          console.warn(`Failed to convert JS path: ${src}`);
        }
      }
    });

    // Convert image sources
    $('img[src]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        try {
          const url = new URL(src, baseUrl);
          const filename = path.basename(url.pathname) || 'image';
          $(element).attr('src', `assets/images/${filename}`);
        } catch (error) {
          console.warn(`Failed to convert image path: ${src}`);
        }
      }
    });

    return $.html();
  }
}
