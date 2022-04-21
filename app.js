const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

function processImage(gifPath, idx) {
  return new Promise((resolve, reject) => {
    ffmpeg
      .input(gifPath)
      .outputOptions([
        "-pix_fmt yuv420p",
        "-c:v libx264",
        "-movflags +faststart",
        "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
      ])
      .noAudio()
      .output(`vidgif${idx}.mp4`)
      .on("end", () => {
        console.log("Ended");
        resolve();
      })
      .on("start", () => {
        console.log(`Processing Image #${idx}`);
      })
      .on("error", (e) => {
        reject();
        console.log(e);
      })
      .run();
  });
}




const imgs = ["./mid.gif", "./mid.gif", "./mid.gif", "./mid.gif", "./mid.gif"];

async function main() {
  for (let i = 0; i < 3; i++) {
    try {
      await processImage(imgs[0], i);
    } catch (error) {
      console.log(error);
    }
  }
}

main();
