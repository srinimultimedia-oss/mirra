// Browsers ignore HSTS on HTTP loopback previews; HTTPS deployments enforce it.
export function securityHeaders({allowInlineScripts=false}={}){
 return {
  'Strict-Transport-Security':'max-age=31536000; includeSubDomains',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'"+(allowInlineScripts?" 'unsafe-inline'":"")+"; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'",
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
 };
}
