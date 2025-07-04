const ms = require('ms');

const attachTokens = (res, accessToken, refreshToken) => {
    // attaching access token to cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: ms(process.env.AT_COOKIE_LIFETIME),
    });

    // attaching refresh token to cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: ms(process.env.RT_COOKIE_LIFETIME),
        signed: true,
    });
};

const attachSingle = (res, data, dataName = 'temp') => {
    res.cookie(dataName, data, {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: ms(process.env.TEMP_IMAGE_TOKEN_LIFETIME),
    });
};

module.exports = { attachTokens, attachSingle };
