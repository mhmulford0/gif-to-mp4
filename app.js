const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

function processImage(gifPath, idx) {
  new Promise((resolve, reject) => {
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
      .on("error", (e) => console.log(e))
      .run();
  });
}

const imgs = ["./mid.gif", "./mid.gif", "./mid.gif", "./mid.gif", "./mid.gif"];

function main() {
  for (let i = 0; i < 5; i++) {
    processImage(imgs[0], i);
  }
}

main()