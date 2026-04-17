import * as http from 'http';

export interface HttpResponse {
  statusCode: number;
  body: any;
  raw: string;
}

export class HttpHelper {
  private baseUrl: string;
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl = 'http://localhost:3333') {
    this.baseUrl = baseUrl;
  }

  setAuth(accessToken: string, refreshToken?: string): void {
    this.authToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearAuth(): void {
    this.authToken = null;
    this.refreshToken = null;
  }

  hasAuth(): boolean {
    return this.authToken !== null;
  }

  async get(path: string): Promise<HttpResponse> {
    return this.request('GET', path);
  }

  async post(path: string, body?: any): Promise<HttpResponse> {
    return this.request('POST', path, body);
  }

  async patch(path: string, body?: any): Promise<HttpResponse> {
    return this.request('PATCH', path, body);
  }

  async delete(path: string): Promise<HttpResponse> {
    return this.request('DELETE', path);
  }

  private request(method: string, path: string, body?: any): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 3333,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      };

      if (this.authToken) {
        options.headers!['Authorization'] = `Bearer ${this.authToken}`;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode || 0,
            body: parsed,
            raw: data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout: ${method} ${path}`));
      });

      if (body != null) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }
}
