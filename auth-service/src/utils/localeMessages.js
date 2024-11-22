const MESSAGES = {
  en: {
    success: {
      USER_CREATED: 'User created successfully.',
      USER_UPDATED: 'User data updated successfully.',
      OK: 'Operation completed.',
      TOKEN_UPDATED: 'Token updated.',
      LOGGED_IN: 'User authorized successfully.',
    },
    error: {
      SAME_USERNAME: 'Username is already in use.',
      USERNAME_EMPTY: "Username can't be empty.",
      USERNAME_SHORT: 'Username should contain at least 4 symbols.',
      USERNAME_INVALID:
        'Username should contain only letters, numbers or underscore.',
      PASSWORD_SHORT: "Password can't be shorter than 6 symbols.",
      PASSWORD_NUM: 'Password should contain at least one number.',
      PASSWORD_CAPITAL: 'Password should contain at least one capital letter.',
      UNKNOWN_ERROR: 'Unknown error.',
      USER_NOT_FOUND: 'User not found.',
      INCORRECT_PASSWORD: 'Password is incorrect.',
      GOOGLE_CODE_EMPTY:
        'No code was received from Google. Try logging in again.',
      EMAIL_TAKEN: 'Email is already in use.',
      RT_EMPTY: 'Refresh Token is not provided.',
      TOKEN_NOT_FOUND: 'This Refresh Token has not been issued.',
      TOKEN_EXPIRED: 'Token expired.',
    },
  },
  ru: {
    success: {
      USER_CREATED: 'Пользователь успешно зарегистрирован.',
      USER_UPDATED: 'Данные пользователя успешно обновлены.',
      OK: 'Операция выполнена.',
      TOKEN_UPDATED: 'Токен обновлен.',
      LOGGED_IN: 'Пользователь успешно авторизован',
    },
    error: {
      SAME_USERNAME: 'Пользователь с таким именем уже существует',
      USERNAME_EMPTY: 'Имя пользователя не может быть пустым',
      USERNAME_SHORT:
        'Имя пользователя должнодолжно содержать минимум 4 символа',
      USERNAME_INVALID:
        'Имя пользователя должно содержать только латиницу, цифры или _',
      PASSWORD_SHORT: 'Пароль не может быть короче 6 символов',
      PASSWORD_NUM: 'Пароль должен содержать хотя бы одну цифру',
      PASSWORD_CAPITAL: 'Пароль должен содержать хотя бы одну заглавную букву',
      UNKNOWN_ERROR: 'Неизвестная ошибка',
      USER_NOT_FOUND: 'Пользователь не найден.',
      INCORRECT_PASSWORD: 'Пароль неверен.',
      GOOGLE_CODE_EMPTY:
        'Не был получен код от Google. Повторите попытку входа.',
      EMAIL_TAKEN: 'Почта уже используется.',
      RT_EMPTY: 'Refresh Token не был предоставлен.',
      TOKEN_NOT_FOUND: 'Этот Refresh Token не был выдан.',
      TOKEN_EXPIRED: 'Токен истек.',
    },
  },
};
module.exports = MESSAGES;
