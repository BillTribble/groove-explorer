#!/usr/bin/env python3
"""Local dev server for Groove explorer.

Serves this folder on every network interface (so a phone on the same Tailscale
network can reach it) and tells browsers not to cache anything, so a reload always
shows the latest files.

    python3 serve.py            # port 8770
    python3 serve.py 9000       # another port
"""
import functools
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # quiet; errors still surface as HTTP status codes in the browser


if __name__ == '__main__':
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    with http.server.ThreadingHTTPServer(('0.0.0.0', PORT), handler) as httpd:
        print(f'Groove explorer on http://0.0.0.0:{PORT} (serving {ROOT})', flush=True)
        httpd.serve_forever()
