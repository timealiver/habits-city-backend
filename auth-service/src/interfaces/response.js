const MESSAGES = require('../utils/localeMessages');
class ApiResponse {
  constructor(status, code, message, data) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static createSuccess(locale, code, data) {
    const message = MESSAGES[locale]?.success[code];
    return new ApiResponse('success', code, message, data);
  }

  static createError(locale, code, data) {
    const message = MESSAGES[locale]?.error[code];
    return new ApiResponse('error', code, message, data);
  }
}

module.exports = ApiResponse;
