const session = require('express-session');

module.exports = session({
    secret: 'JMsgmBe7nbZqw59OPO',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // 开发环境下不使用 HTTPS
        httpOnly: true,
    },
});