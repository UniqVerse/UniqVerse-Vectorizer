// serve http requests
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('Hello World!');
});
// return similar images
// code example:
// const resImage = await client.graphql.get()
//     .withClassName('NFTs')
//     .withFields('name, _additional { id distance }')
//     // .withFields(['name', '_additional { id distance }'])
//     .withNearImage({ image: test, distance: 1 })
//     // .withLimit(1)
//     .do();

app.post('/similar', async (req, res) => {
    const client = weaviate.client({
        scheme: 'http',
        host: '137.184.41.20:8080',
    });
    const weaviate = require("weaviate-ts-client");
    const { image, distance } = req.body;
    const test = Buffer.from(image, 'base64').toString('base64');
    const resImage = await client.graphql.get()
        .withClassName('NFTs')
        .withFields('name, _additional { id distance }')
        .withNearImage({ image: test, distance: distance })
        .do();
    res.send(resImage.data.Get.NFTs);
});
// here is an example using nextjs fetch how to call it
// const res = await fetch('http://localhost:3000/similar', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//         image: 'base64string',
//         distance: 1,
//     }),
// });

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
