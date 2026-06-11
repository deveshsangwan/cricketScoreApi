import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CRICBUZZ_BASE_URL } from './CricbuzzUtils';
import { logExternalAPICall, logPerformance, writeLogDebug, writeLogError } from '@core/Logger';

export class CricbuzzClientError extends Error {
    public readonly url: string;
    public readonly statusCode?: number;

    constructor(message: string, url: string, statusCode?: number) {
        super(message);
        this.name = 'CricbuzzClientError';
        this.url = url;
        this.statusCode = statusCode;
    }
}

export class CricbuzzClient {
    private readonly REQUEST_TIMEOUT = 10000;
    private readonly DEFAULT_USER_AGENT =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

    public async fetchHtml(pathOrUrl: string): Promise<string> {
        const response = await this.request<string>(pathOrUrl, {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            responseType: 'text',
        });

        return typeof response === 'string' ? response : String(response);
    }

    public async fetchJson<T>(pathOrUrl: string): Promise<T> {
        return this.request<T>(pathOrUrl, {
            Accept: 'application/json,text/plain,*/*',
            responseType: 'json',
        });
    }

    private async request<T>(
        pathOrUrl: string,
        options: { Accept: string; responseType: AxiosRequestConfig['responseType'] }
    ): Promise<T> {
        const url = this.buildUrl(pathOrUrl);
        const startTime = Date.now();
        writeLogDebug(['CricbuzzClient: request - Starting', { url }]);

        const requestOptions: AxiosRequestConfig = {
            url,
            method: 'GET',
            timeout: this.REQUEST_TIMEOUT,
            responseType: options.responseType,
            headers: {
                'User-Agent': this.DEFAULT_USER_AGENT,
                Accept: options.Accept,
                'Accept-Language': 'en-US,en;q=0.9',
                Referer: CRICBUZZ_BASE_URL,
            },
            validateStatus: (status) => status >= 200 && status < 300,
        };

        try {
            const response: AxiosResponse<T> = await axios(requestOptions);
            const duration = Date.now() - startTime;
            logExternalAPICall(url, 'GET', response.status, duration);
            logPerformance('CricbuzzClient-request', duration, {
                url,
                statusCode: response.status,
            });
            return response.data;
        } catch (error) {
            const duration = Date.now() - startTime;
            const axiosError = error as AxiosError;
            const statusCode = axiosError.response?.status;
            const message = axiosError.message || 'Unknown Cricbuzz request error';

            writeLogError([
                'CricbuzzClient | request | error',
                {
                    url,
                    statusCode,
                    error: message,
                    duration: `${duration}ms`,
                },
            ]);
            logExternalAPICall(url, 'GET', statusCode, duration, message);

            throw new CricbuzzClientError(
                `Failed to fetch Cricbuzz data: ${message}`,
                url,
                statusCode
            );
        }
    }

    private buildUrl(pathOrUrl: string): string {
        if (!pathOrUrl) {
            throw new CricbuzzClientError('URL is required', CRICBUZZ_BASE_URL);
        }

        return new URL(pathOrUrl, CRICBUZZ_BASE_URL).toString();
    }
}
