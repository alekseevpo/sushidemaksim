import express from 'express';
const app = express();
app.get('/test', (req, res) => res.send('ok'));
app.listen(3002, () => console.log('Listening on 3002'));
