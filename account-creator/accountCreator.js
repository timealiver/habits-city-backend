const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const authUrl = 'http://localhost:5000/auth/registration';
const changeAvatarUrl = 'http://localhost:5001/user/changeAvatar';
const avatarsDir = path.join(__dirname, 'avatars');
const namesFile = path.join(__dirname, 'names.txt');

async function login(username, password) {
  try {
    const response = await axios.post(authUrl, { username, password });
    return response.data.data.AccessToken;
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw error;
  }
}

async function changeAvatar(token, avatarPath) {
  try {
    const form = new FormData();
    form.append('avatar', fs.createReadStream(avatarPath));

    const response = await axios.post(changeAvatarUrl, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Avatar changed successfully:', response.data);
  } catch (error) {
    console.error('Error changing avatar:', error.message);
    throw error;
  } finally {
    fs.unlinkSync(avatarPath);
  }
}

async function main() {
  const password = 'PIVKA_DLYA_RIVKA1';
  const avatarFiles = fs.readdirSync(avatarsDir);

  for (let i = 0; i < 100; i++) {
    const names = fs
      .readFileSync(namesFile, 'utf-8')
      .split(/\r?\n/)
      .filter(Boolean);
    if (names.length === 0) {
      console.error('No more names available in names.txt');
      break;
    }

    const username = names[0];
    try {
      const token = await login(username, password);
      const avatarFile = avatarFiles[i % avatarFiles.length];
      const avatarPath = path.join(avatarsDir, avatarFile);
      await changeAvatar(token, avatarPath);

      // Remove the username from the file
      fs.writeFileSync(namesFile, names.slice(1).join('\n'));
    } catch (error) {
      console.error(`Error processing username ${username}:`, error.message);
    }
  }
}

main();
