import { promises as fs } from 'fs';
import path from 'path';
import { config } from './config.js';

export interface UxIssue {
  severity: 'high' | 'medium' | 'low';
  file: string;
  message: string;
}

export async function auditSiteUx(files: string[] = ['index.html']): Promise<UxIssue[]> {
  const issues: UxIssue[] = [];
  for (const file of files) {
    const full = path.join(config.themeDir, file);
    let html: string;
    try {
      html = await fs.readFile(full, 'utf8');
    } catch {
      issues.push({ severity: 'high', file, message: 'File not found.' });
      continue;
    }

    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
      issues.push({ severity: 'high', file, message: 'Missing responsive viewport meta tag.' });
    }

    const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
    const imgsMissingAlt = imgTags.filter((t) => !/alt=["'][^"']*["']/i.test(t));
    if (imgsMissingAlt.length) {
      issues.push({ severity: 'medium', file, message: `${imgsMissingAlt.length}/${imgTags.length} <img> tags missing alt text.` });
    }

    if (!/aria-label|role=/i.test(html)) {
      issues.push({ severity: 'low', file, message: 'No aria-label/role attributes detected — verify accessible landmarks.' });
    }

    if (!/(nav-hamburger|mobile-menu|hamburger)/i.test(html)) {
      issues.push({ severity: 'medium', file, message: 'No mobile navigation pattern detected.' });
    }

    if (!/(free shipping|secure checkout|money.?back|guarantee|trusted by)/i.test(html)) {
      issues.push({ severity: 'low', file, message: 'No obvious trust-signal copy detected (shipping/security/guarantee messaging).' });
    }
  }
  return issues;
}
