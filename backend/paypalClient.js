// paypalClient.js
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// 环境配置
function environment() {
    const clientId = "AX2YAQ3gXr-WidNvgMevZM5ysidZRocYDSF2sxkp5FXjhv8gcQtLpJ7A9YR7PG58N0NRJcEUXgVLrTSb";
    const clientSecret = "EI3zF93pCbskJJYeKvHyqQG9Qch1VTNxj9lCfLQJzWfveYDLu40ASF15uaJZSXw3F2DzCSN3x-_QaZBJ";

    // Sandbox 环境 (开发测试用)
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal 客户端实例
function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };