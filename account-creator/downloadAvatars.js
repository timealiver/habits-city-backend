const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const url =
  'https://www.google.com/search?sca_esv=69dffed68e86d379&q=%D0%B0%D0%BD%D0%B8%D0%BC%D0%B5+%D0%B0%D0%B2%D1%8B+%D0%B4%D0%BB%D1%8F+%D0%BF%D0%B0%D1%80%D0%BD%D0%B5%D0%B9+%D0%BA%D1%80%D1%83%D1%82%D1%8B%D0%B5+%D0%B0%D0%B2%D1%8B+%D0%B0%D0%B2%D0%B0%D1%82%D0%B0%D1%80%D0%BA%D0%B0+%D0%B2%D0%BA&uds=ADvngMjcH0KdF7qGWtwTBrP0nt7dax1U7Pf8NODvbkUNpJHeYwVGuArekSzpkpXn5CSz4bActKEbYc1D_FYxFFU747__FXNACPXLagnoZxItE-rZM0AIBnsWqpwe5cHZzk6HfjuXeXOVK2szsAprLNWzxHl2T96jHXBbiAX7UWa3fMOoEXwRn5iv9FiXCdUhdXpYwZIpbriZQqapYAlC35S9HVrqODVGmSeXI5kcIjhbDWsTfSvod4WDyTpH5JLKaHTaWGfHkoWnKc-vBdPc-ZYkHIuYNRT4n8gI4dQS0QlMkev2ThiU1QQ&udm=2&sa=X&ved=2ahUKEwjenL2a6v-JAxUEFlkFHVXhPB8QxKsJegQICxAB&ictx=0&biw=1536&bih=695&dpr=1.25';
const outputDir = 'avatars';

async function downloadImages() {
  try {
    // Создаем папку для сохранения изображений
    await fs.ensureDir(outputDir);

    // Получаем HTML страницы
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Находим все изображения
    const images = $('img');
    const imageUrls = [];

    images.each((index, element) => {
      const imgUrl = $(element).attr('src');
      if (imgUrl && imgUrl.startsWith('http')) {
        imageUrls.push(imgUrl);
      }
    });

    // Скачиваем и сохраняем изображения
    for (let i = 0; i < imageUrls.length; i++) {
      const imgUrl = imageUrls[i];
      const fileName = `${uuidv4()}.jpg`; // Генерация случайного имени файла
      const writer = fs.createWriteStream(path.join(outputDir, fileName));

      const response = await axios({
        url: imgUrl,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(
        `Downloaded image ${i + 1}/${imageUrls.length} as ${fileName}`,
      );
    }

    console.log('All images downloaded successfully');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadImages();
