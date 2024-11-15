export const emailTemplate = (code: string) => `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Код для авторизации на HabitsCity</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 700px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #333333;
        }
        .content {
            margin-bottom: 20px;
        }
        .content p {
            color: #555555;
            line-height: 1.6;
        }
        .code {
            text-align: center;
            margin-bottom: 20px;
        }
        .code h2 {
            color: #007BFF;
            font-size: 24px;
            margin: 0;
        }
        .footer {
            text-align: center;
            color: #999999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Код для изменения данных на HabitsCity</h1>
        </div>
        <div class="content">
            <p>Вы получили это сообщение, т.к. на ваш email был запрошен код для изменения данных на сайте HabitsCity. Если вы этого не делали, не отвечайте на сообщение.</p>
        </div>
        <div class="code">
            <h2>Код: ${code}</h2>
        </div>
        <div class="footer">
            <p>Если у вас возникли вопросы, пожалуйста, свяжитесь с нашей службой поддержки.</p>
        </div>
    </div>
</body>
</html>
`;