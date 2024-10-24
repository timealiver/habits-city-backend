require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ru-central1', // Укажите ваш регион
  endpoint: 'hb.ru-msk.vkcloud-storage.ru',
});
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);

const s3 = new AWS.S3();
(async () => {
  try {
    await s3
      .putObject({
        Body: 'hello world',
        Bucket: 'users-photo',
        Key: 'my-file.txt',
      })
      .promise();
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
})();

console.log('done');
