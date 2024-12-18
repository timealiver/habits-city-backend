export const STATUS_CODES = {
    // Ошибки
    UNKNOWN_ERROR: 400,
    INVALID_DATA: 400,  
    SAME_PASSWORD: 400,    
    EMPTY_FIELDS:400, 
    INVALID_OLD_PASSWORD: 400,
    NOT_AN_EMAIL:400,
    EMAIL_TAKEN: 400, 
    EMAIL_SEND_FAILED: 400, 
    INCORRECT_CODE:400,
    CODE_EXPIRED:400,
    USERNAME_INVALID:400,
    USERNAME_SHORT:400,
    USERNAME_TAKEN:400,
    USER_NOT_FOUND: 404,   // Not Found
    UNAUTHORIZED: 401,     // Unauthorized
    INTERNAL_ERROR: 500,   // Internal Server Error
  
    // Успехи
    PASSWORD_UPDATED: 200, // OK
    USER_CREATED: 201,     // Created
    USER_UPDATED: 200,     // OK
  };