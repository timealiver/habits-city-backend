const MESSAGES = {
  en: {
    success: {
      USER_UPDATED: 'User data updated successfully.',
      OK: 'Operation completed.',
    },
    error: {
      SAME_USERNAME: 'Username is already in use',
      USERNAME_EMPTY: "Username can't be empty",
      PASSWORD_SHORT: "Password can't be shorter than 6 symbols",
      PASSWORD_NUM: 'Password should contain at least one number',
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
      PASSWORD_SHORT: 'Пароль не может быть короче 6 символов',
      PASSWORD_NUM: 'Пароль должен содержать хотя бы одну цифру',
    },
  },
};
module.exports = MESSAGES;
