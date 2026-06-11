import * as cheerio from 'cheerio';

export const CRICBUZZ_BASE_URL = 'https://www.cricbuzz.com';

export function cleanText(value: unknown): string {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stripHtml(value: unknown): string {
    const text = cleanText(value);
    if (!text) {
        return '';
    }

    try {
        return cleanText(cheerio.load(`<div>${text}</div>`)('div').text());
    } catch (_error) {
        return cleanText(text.replace(/<[^>]*>/g, ''));
    }
}

export function normalizeCricbuzzPath(pathOrUrl: string): string | null {
    const trimmed = cleanText(pathOrUrl);
    if (!trimmed) {
        return null;
    }

    try {
        const url = new URL(trimmed, CRICBUZZ_BASE_URL);
        return `${url.pathname}${url.search}`;
    } catch (_error) {
        return trimmed.startsWith('/') ? trimmed : null;
    }
}

export function extractCricbuzzMatchIdFromUrl(pathOrUrl: string): string | null {
    const normalizedPath = normalizeCricbuzzPath(pathOrUrl);
    if (!normalizedPath) {
        return null;
    }

    const match = normalizedPath.match(/\/(?:live-cricket-scores|live-cricket-scorecard)\/(\d+)(?:\/|$)/);
    return match?.[1] ?? null;
}

export function buildMatchNameFromAnchor(title: unknown, text: unknown): string {
    const cleanTitle = cleanText(title);
    if (cleanTitle) {
        return cleanText(cleanTitle.split(' - ')[0]);
    }

    return cleanText(text).replace(/\bLIVE\b/g, '').trim();
}

export function toNumber(value: unknown, defaultValue = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : defaultValue;
    }

    return defaultValue;
}

export function toStringValue(value: unknown, defaultValue = ''): string {
    if (value === undefined || value === null) {
        return defaultValue;
    }

    return String(value);
}
