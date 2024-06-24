import sharp from "sharp";
import * as svg from "../utils/svgRender.js";
import axios from "axios";

/**
 * Route for handling GH profile picture import
 * @param {Object} app - Express application instance
 */
export default function (app) {
  const addImage = (base64, format, width, height) => {
    return ` <g transform="translate(0, 0)">
        <image class="icon" 
            href="data:image/${format};base64,
            ${base64}" 
            width="${width.toString()}"
            height="${height.toString()}">
        </image>  
    </g>`;
  };

  const addRect = (width, height) => {
    return ` <rect x="${0}" y="${
      height * 0.9
    }" width="${width}" fill="black" fill-opacity="0.9" height="${
      height * 0.1
    }"/>`;
  };
  const addPeace = (width, height, username) => {
    return `<text x='${width / 2}' y='${
      height * 0.972
    }' text-anchor="middle" class='peace' >☮️ ${username}</text>`;
  };

  const addStyles = (width) => {
    return `<defs>
        <linearGradient id="ukraine">
            <stop class="stop1" offset="0%"/>
            <stop class="stop2" offset="100%"/>
        </linearGradient>

        <style>
            .stop1 { stop-color: #ffcc00 ; }
            .stop2 { stop-color: #0057b7;}

            .peace {
                fill: url(#ukraine);
                font: 600 ${width / 14}px 'Segoe UI', Ubuntu, Sans-Serif;
            }
        </style>
        
        </defs>\n`;
  };

  // GH Profile Picture
  app.post("/gh_profile_pic/:username", async (req, res) => {
    const username = req.params.username;

    // get github user data
    const { data: ghData } = await axios.get(
      `https://api.github.com/users/${username}`
    );

    // download image
    const { data: imgBuffer } = await axios.get(ghData.avatar_url, {
      responseType: "arraybuffer",
    });

    // get metadata
    const metadata = await sharp(imgBuffer).metadata();
    var imgWidth = metadata.width;
    var imgHeight = metadata.height;
    console.log(metadata);

    // generate svg
    let body =
      svg.svgHeader(imgWidth, imgHeight) +
      addStyles(imgWidth) +
      addImage(
        await imgBuffer.toString("base64"),
        metadata.format,
        imgHeight,
        imgWidth
      ) +
      addRect(imgWidth, imgHeight) +
      addPeace(imgWidth, imgHeight, username) +
      svg.svgEnd();

    const png = await sharp(Buffer.from(body)).png().toBuffer();
    const pngOut = await png.toString("base64");
    res.type("image/png").status(200).send(pngOut);
  });

  // GH Profile Picture
  app.get("/gh_rate_limit", async (req, res) => {
    // get github user data
    const { data: ghRateLimit } = await axios.get(
      "https://api.github.com/rate_limit"
    );
    res.status(200).send(ghRateLimit);
  });
}
