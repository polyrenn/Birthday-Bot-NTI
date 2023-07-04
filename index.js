"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const nodeHtmlToImage = require('node-html-to-image');
const { WebClient } = require('@slack/web-api');
const { GetObjectCommand, S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');
function localNodeHtmlToImage() {
    return __awaiter(this, void 0, void 0, function* () {
        const s3 = new S3Client({
            credentials: {
                accessKeyId: 'AKIA4OVWLAXW3TI64MWS',
                secretAccessKey: '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',
            }
        });
        //I'm feeling Lucky
        const getColorScheme = (colorScheme) => {
            const diagonalColorArray = [
                {
                    colorScheme: 'blue',
                    foreground: '#CBE2EC',
                    background: '#E1F6FF'
                },
                {
                    colorScheme: 'timberwolf',
                    foreground: '#D1D1C9',
                    background: '#FFFFEE'
                },
                {
                    colorScheme: 'cream',
                    foreground: '#E9F4B1',
                    background: '#CACDB9'
                },
                {
                    colorScheme: 'silver',
                    foreground: '#A8A6A6',
                    background: '#CDE7F3'
                },
                {
                    colorScheme: 'floral-white',
                    foreground: '#A8A6A6',
                    background: '#FFF7ED'
                },
                {
                    colorScheme: 'ivory',
                    foreground: '#E9F4B1',
                    background: '#FFFFEE'
                },
            ];
            return diagonalColorArray.find((element) => element.colorScheme === colorScheme);
        };
        //Refactor to array of objects
        const diagonalColors = {
            blue: '#CBE2EC',
            timberwolf: '#D1D1C9',
            cream: '#E9F4B1',
            silver: '#A8A6A6'
        };
        const filename = 'svg.txt';
        const contents = fs.readFileSync('Group5.svg', 'utf8');
        //Define a regular expression to search for
        const regex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
        //Probably Refactor into a function that returns a value
        const streakBackgroundColor = getColorScheme('floral-white');
        // Replace all instances of the regular expression with a new string
        const newContents = contents.replaceAll(regex, streakBackgroundColor === null || streakBackgroundColor === void 0 ? void 0 : streakBackgroundColor.foreground);
        // Write the modified contents back to the file
        fs.writeFileSync('Group5.svg', newContents, 'utf8');
        const paramsEvent = { Bucket: 'slack-transformed-images', Key: 'Abee.jpg' };
        const commandEvent = new GetObjectCommand(paramsEvent);
        const url = yield getSignedUrl(s3, commandEvent);
        const downloadResponse = yield fetch(url, {
            method: "GET",
        });
        const arrayBuffer = yield downloadResponse.arrayBuffer();
        const base64Image = yield Buffer.from(arrayBuffer).toString('base64');
        const cowrywiseLogo = yield fs.readFileSync('./Vector.svg').toString('base64');
        const base64Logo = yield Buffer.from(cowrywiseLogo);
        const backgroundStreaks = yield fs.readFileSync('./Group5.svg').toString('base64');
        const base64Background = yield Buffer.from(backgroundStreaks);
        const returnColorScheme = getColorScheme('floral-white');
        console.log(returnColorScheme);
        yield nodeHtmlToImage({
            output: './image.png',
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
          background-color: ${returnColorScheme === null || returnColorScheme === void 0 ? void 0 : returnColorScheme.background};
          padding: 40px 60px;
          position: relative;
          background-image: url('data:image/svg+xml;base64,${base64Background}');
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
          margin-bottom: 16px;
          font-size: 64px;
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
          font-size: 36px;
          font-family: 'BR Firma';
          font-weight: 400;
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
                  <p class="main-text">Happy Birthday Renn 🎉</p>
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
            beforeScreenshot: (page) => __awaiter(this, void 0, void 0, function* () {
                yield page.setViewport({
                    width: 1080,
                    height: 1080,
                    deviceScaleFactor: 1
                });
            })
        });
    });
}
module.exports = localNodeHtmlToImage;
