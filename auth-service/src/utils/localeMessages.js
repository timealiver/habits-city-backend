const MESSAGES = {
  en: {
    success: {
      USER_UPDATED: 'User data updated successfully.',
      OK: 'Operation completed.',
    },
    error: {
      SAME_USERNAME: 'Username is already in use',
      USERNAME_EMPTY: "Username can't be empty",
      USERNAME_SHORT: 'Username should contain at least 4 symbols',
      USERNAME_INVALID:
        'Username should contain only letters, numbers or underscore',
      PASSWORD_SHORT: "Password can't be shorter than 6 symbols",
      PASSWORD_NUM: 'Password should contain at least one number',
      PASSWORD_CAPITAL: 'Password should contain at least one capital letter',
    },
  },
  ru: {
    success: {
      USER_UPDATED: 'Данные пользователя успешно обновлены.',
      OK: 'Операция выполнена.',
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
    },
  },
};
module.exports = MESSAGES;
