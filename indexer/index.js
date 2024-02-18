// serve http requests
import express from 'express';
import weaviate from 'weaviate-ts-client';
import fs from 'fs';
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 4000;

const client = weaviate.client({
    scheme: 'http',
    host: '137.184.41.20:8080',
});
const s3client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION || "eu-central-1",
});
const s3Bucket = "uniqverse";

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

app.post('/upload', (req, res) => {
    console.log(req.files.image)
    const { image } = req.body;
    const buffer = Buffer.from(image, 'base64');
    fs.writeFileSync('nfts/image.jpg', buffer);
    res.send('ok');
});


app.post('/similar', async (req, res) => {
    console.log(req.body)
    const { image, distance } = req.body;
    const cmd = new GetObjectCommand({
        Bucket: s3Bucket,
        Key: `nfts/${image}`
    })
    const nftResp = await s3client.send(cmd);
    console.log(nftResp);
    // read nftResp.Body stream as base64

    let str = await nftResp.Body.transformToByteArray();
    const b64 = Buffer.from(str).toString('base64');
    const resImage = await client.graphql.get()
        .withClassName('NFTs')
        .withFields('name, _additional { id distance }')
        .withNearImage({ image: b64, distance: distance })
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

// get image url, download image and index it in the weaviate
app.post('/index', async (req, res) => {
    const { imageUrl, name } = req.body;
    const buffer = await (await fetch(imageUrl)).buffer();
    const b64 = Buffer.from(buffer).toString('base64');
    await client.data.creator()
        .withClassName('NFTs')
        .withProperties({
            image: b64,
            name: name,
        })
        .do();
    res.send('ok');
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});


