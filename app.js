const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const nodeHtmlToImage = require("node-html-to-image");
const { WebClient } = require("@slack/web-api");
const {
  GetObjectCommand,
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const useColorScheme = require("./color");
//const localNodeHtmlToImageImport = require('./local')

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});


const getUrl = async () => {
  const params = { Bucket: "birthday-designs", Key: "my-object-key" };
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(s3, command);
  console.log(url);
};


const uploadImageToS3 = async (fileUrlFromMessage, fileNameFromMessage) => {
  const fileUrl = fileUrlFromMessage;
  const downloadResponse = await fetch(fileUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
  });
  const outputFilename = fileNameFromMessage;

  const transformedBuffer = await downloadResponse.arrayBuffer();

  const transformed = Buffer.from(transformedBuffer);

  const params = {
    Bucket: "imgcroptest",
    Key: fileNameFromMessage,
    Body: transformed,
    ContentType: "image/jpeg",
  };

  const command = new PutObjectCommand(params);

  const response = await s3.send(command);

  console.log(response.$metadata);
};

const transformImageFromS3 = async (fileKey) => {
  const imageRequest = JSON.stringify({
    bucket: "imgcroptest",
    key: fileKey,
    edits: {
      smartCrop: {
        faceIndex: 0, // zero-based index of detected faces
        padding: 500, // padding expressed in pixels, applied to all sides
      },
    },
  });
  const transformedRequestString = Buffer.from(imageRequest, "utf-8").toString(
    "base64"
  );
  const CloudFrontUrl = "https://d2gtl62twmopm.cloudfront.net";

  const editUrl = `${CloudFrontUrl}/${transformedRequestString}`;

  const grayResponse = await fetch(editUrl, {
    method: "GET",
  });
  const greyOutputFileName = "gray.jpg";
  const transformedGrayBuffer = await grayResponse.arrayBuffer();
  const transformedGray = Buffer.from(transformedGrayBuffer);
  console.log(editUrl);
  return transformedGray;
};

const uploadToSlackTransformedImages = async (fileKey, body) => {
  const params = {
    Bucket: "slack-transformed-images",
    Key: `${fileKey}`,
    ContentType: "image/jpeg",
    Body: body,
  };

  const command = new PutObjectCommand(params);

  const response = await s3.send(command);

  console.log(response.$metadata);
};

module.exports.handler = async (event) => {
  await uploadImageToS3(event.slackFileLink, event.fileName);

  const transformedImage = await transformImageFromS3(event.fileName);

  await uploadToSlackTransformedImages(event.fileName, transformedImage);

  //const objectKey = event.Records[0].s3.object.key;

  // Extract the file name from the object key
  //const fileName = objectKey.split('/').pop();

  const web = new WebClient(
    "xoxb-4699850119287-4719021486260-79PMJ5fanMnXNcHkfdqD43QA"
  );

  //Read Vector File
  const contents = fs.readFileSync("Group5.svg", "utf8");
  
  //Define a regular expression to search for

  const regex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;

  //Probably Refactor into a function that returns a value

  const streakBackgroundColor = useColorScheme(event.color);
  // Replace all instances of the regular expression with a new string
  const newContents = contents.replaceAll(
    regex,
    streakBackgroundColor?.foreground
  );

  // Create Svg Buffer
  const modifiedSvgBuffer = Buffer.from(newContents).toString("base64");

  const paramsEvent = {
    Bucket: "slack-transformed-images",
    Key: event.fileName,
  };
  const commandEvent = new GetObjectCommand(paramsEvent);
  const url = await getSignedUrl(s3, commandEvent);

  const downloadResponse = await fetch(url, {
    method: "GET",
  });

  const arrayBuffer = await downloadResponse.arrayBuffer();

  const base64Image = await Buffer.from(arrayBuffer).toString("base64");

  const cowrywiseLogo = await fs
    .readFileSync("./Vector.svg")
    .toString("base64");
  const base64Logo = await new Buffer.from(cowrywiseLogo);

  const backgroundStreaks = await fs
    .readFileSync("./Group5.svg")
    .toString("base64");
  const base64Background = await new Buffer.from(backgroundStreaks);

  //Background Color
  const backgroundColor = useColorScheme(event.color);

  const { background } = backgroundColor;

  const image = await nodeHtmlToImage({
    html: `<html>
      <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
       body {
          width: 1080px;
          height: 1080px;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          background-color: ${background};
          padding: 72px 64px;
          position: relative;
          background-image: url('data:image/svg+xml;base64,${modifiedSvgBuffer}');
          font-family: "Noto Color Emoji";
        }
        h3 {
          margin: 0;
      }
      
      p {
          margin: 0;
      }
      
      .top-section {
          display: flex;
      }
      
      .logo-wrap {
          width: 100%;
          display: flex;
          justify-content: flex-end;
      }
      
      .logo {
          background-image: url('data:image/svg+xml;base64,${base64Logo}');
          width: 56px;
          height: 56px;
          background-size: contain;
          margin-bottom: 16px;
      }
      
      .wrapper {
        width: 100%;
        height: 100%;
    }
      
      .wrapper:before {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0.6;
          z-index: 0;
          background-repeat: no-repeat;
          background-position: 50% 0;
          background-size: contain
        }
        
      
      .header {
          font-family: 'BR Firma';
          color: #0066f5;
          height: 10%;
      }
      
      .confetti {
          background-image: url('confetti.svg');
          width: 56px;
          height: 56px;
          background-size: contain;
      }
      
      .main-text {
          margin: 0;
          margin-bottom: 24px;
          font-size: 60px;
          font-weight: 600;
      }
      
      .header-subtext {
          font-size: 48px;
      }
      
      .image-wrapper {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 70%;
          flex-flow: row-reverse;
          z-index: 1;
      }
      
      .image {
          width: 579px;
          height: 579px;
          background-image: url('data:image/jpeg;base64,${base64Image}');
          background-size: cover;
          border-radius: 500px 500px 500px 0;
          background-repeat: no-repeat;
      }
      
      .subtext {
          font-size: 40px;
          font-family: 'BR Firma';
          font-weight: 500;
          color: #0066f5
      }
        </style>
      </head>
      <body>
      <div class="wrapper">
          <div class="logo-wrap">
              <div class="logo">
  
              </div>
          </div>
          
          <div class="top-section">
              <div class="header">
                  <p class="main-text">Happy Birthday ${event.name} 🎉</p>
                  <p class="header-subtext">Have a great year!</p>
              </div>
          </div>
          
  
          <div class="image-wrapper">
              <div class="image">
            
              </div>
              <div class="subtext">
                  <p>With love, <br/> Cowrywise.</p>
              </div>
          </div>
       
      </div>
  </body>
    </html>
    `,
    puppeteer: puppeteer,
    puppeteerArgs: {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
    },
    beforeScreenshot: async (page) => {
      await page.setViewport({
        width: 1080,
        height: 1080,
        deviceScaleFactor: 1,
      });
    },
  });
  console.log(image);
  const params = {
    Bucket: "birthday-designs",
    Key: "my-object-key",
    Body: image,
    ContentType: "image/jpeg",
  };

  const command = new PutObjectCommand(params);

  const response = await s3.send(command);
  console.log(response);
  console.log(event);
  const paramsGetSignedUrl = {
    Bucket: "birthday-designs",
    Key: "my-object-key",
  };
  const commandGetSignedUrl = new GetObjectCommand(paramsGetSignedUrl);
  const signedUrl = await getSignedUrl(s3, commandGetSignedUrl);

  //Create Image Buffer

  const remoteBirthdayImage = await fetch(signedUrl);
  const remoteBirthdayImageArrayBuffer =
    await remoteBirthdayImage.arrayBuffer();

  const imageBuffer = Buffer.from(remoteBirthdayImageArrayBuffer);

  // Call the chat.postMessage method with the required parameters
  //Here's Your Image It Expires Soon
  const responsePostMessage = await web.chat.postMessage({
    channel: "C04LXD2JHLM",
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "Here's your Birthday Flyer",
        },
      },
      {
        type: "image",
        title: {
          type: "plain_text",
          text: "Birthday Flyer",
          emoji: true,
        },
        image_url: `${signedUrl}`,
        alt_text: "Birthday Flyer",
      },
    ],
  });

  const uploadBirthdayDesign = await web.filesUploadV2({
    file: imageBuffer,
    filename: "Birthday Design",
    channel_id: "C04LXD2JHLM",
    initial_comment: "Birthday Design",
  });
  return signedUrl;
};
