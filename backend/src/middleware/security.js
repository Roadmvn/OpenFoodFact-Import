const xss = require('xss-clean');
const { randomBytes } = require('crypto');

// Protection XSS
const xssProtection = xss();

// Génération de token CSRF
const generateCsrfToken = (req, res, next) => {
    if (!req.session) {
        req.session = {};
    }
    if (!req.session.csrfToken) {
        req.session.csrfToken = randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
};

// Nettoyage des données
const sanitizeData = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/javascript:/gi, '')
                    .replace(/data:/gi, '')
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
        }
    }
    next();
};

// En-têtes de sécurité supplémentaires
const securityHeaders = (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        );
    }
    next();
};

module.exports = {
    xssProtection,
    generateCsrfToken,
    sanitizeData,
    securityHeaders
};
