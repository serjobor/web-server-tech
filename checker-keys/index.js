const express = require('express');
const multer = require('multer');
const forge = require('node-forge');

const app = express();
const upload = multer();

const LOGIN = 'serjo4110';

app.get('/login', (req, res) => {
    res.send(LOGIN);
});

app.post('/decypher', upload.fields([{ name: 'key' }, { name: 'secret' }]), (req, res) => {
    try {
        const keyBuffer = req.files['key'][0].buffer;
        const secretBuffer = req.files['secret'][0].buffer;

        const privateKeyPem = keyBuffer.toString();
        const encryptedData = secretBuffer.toString('base64');

        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        const decrypted = privateKey.decrypt(forge.util.decode64(encryptedData), 'RSA-OAEP');

        res.send(decrypted);
    } catch (err) {
        res.status(400).send('Ошибка расшифровки: ' + err.message);
    }
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Сервер запущен на порту ${PORT}`);
// });

export default app;
