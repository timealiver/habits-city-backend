const jwt = require('jsonwebtoken');
const { secret } = require('../config/config');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { createTokens, createAccessToken } = require('../utils/createTokens.js');
const ApiResponse = require('../interfaces/response.js');
class tokenController {
  async updateToken(req, res) {
    try {
      let token = req.cookies.refresh_token;
      const locale = req.headers['x-locale-language'];
      if (!token) {
        return res
          .status(400)
          .json(ApiResponse.createError(locale, 'RT_EMPTY', null));
      }
      const payload = jwt.verify(token, secret);
      const isExist = await User.findOne({ _id: payload.userId });
      if (!isExist) {
        return res
          .status(400)
          .json(ApiResponse.createError(locale, 'USER_NOT_FOUND', null));
      }
      const isRefresh = await RefreshToken.findOne({ token });
      if (!isRefresh) {
        return res
          .status(400)
          .json(ApiResponse.createError(locale, 'TOKEN_NOT_FOUND', null));
      }
      const AccessToken = await createAccessToken(payload.userId);
      return res.status(200).json(
        ApiResponse.createSuccess(locale, 'TOKEN_UPDATED', {
          AccessToken: AccessToken,
        }),
      );
    } catch (error) {
      const locale = req.headers['x-locale-language'];
      if (error instanceof jwt.TokenExpiredError) {
        return res
          .status(401)
          .json(ApiResponse.createError(locale, 'TOKEN_EXPIRED', null));
      } else {
        return res.status(401).json(
          ApiResponse.createError(locale, 'UKNOWN_ERROR', {
            error: error.toString(),
          }),
        );
      }
    }
  }
}

module.exports = new tokenController();

/**@swagger
 * /token/update:
 *   get:
 *     summary: Обновление AccessToken с помощью RefreshToken
 *     tags: [Token]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: RefreshToken для обновления AccessToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Токен успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 AccessToken:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
