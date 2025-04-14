const session = require('express-session');

module.exports = session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Utiliser HTTPS en production
        httpOnly: true,
    },
});