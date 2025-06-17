const attachTokensToCookie = (res, accessToken, refreshToken) => {
    // attaching access token to cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: Number(process.env.AT_COOKIE_LIFETIME),
    });

    // attaching refresh token to cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // prevents JS access on client (security)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'Strict', // prevents CSRF in most cases
        maxAge: Number(process.env.RT_COOKIE_LIFETIME),
    });
};

module.exports = attachTokensToCookie;
