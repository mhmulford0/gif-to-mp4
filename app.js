const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const spawn = require("child_process").spawn;

let gifs = ["./big.gif", "./big.gif", "./big.gif", "./big.gif", "./big.gif"];

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
        resolve()
      })
      .on("start", () => {
        console.log(`Processing Image #${idx}`);
      })
      .on("error", (e) => console.log(e))
      .run();
  });
}

// function processGif(gif, quality) {
//   // const ffmpeg = spawn('ffmpeg', ['-i', `${parent}/${video}.mp4`, '-codec:v', 'libx264', '-profile:v', 'main', '-preset', 'slow', '-b:v', '400k', '-maxrate', '400k', '-bufsize', '800k', '-vf', `scale=-2:${quality}`, '-threads', '0', '-b:a', '128k', `${parent}/transcoded/${video}_${quality}.mp4`]);

//   const p = new Promise((resolve, reject) => {
//     const ffmpeg = spawn("ffmpeg", [
//       "-i",
//       `${gif}`,
//       "-c:v libx264",
//       // "-movflags +faststart",
//       // "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
//       "test.mp4"
//     ]);
//     ffmpeg.on("error", (e) => console.log(e));
//     ffmpeg.on("close", (code) => {
//       console.log("done")
//       resolve();
//     });
//   });
//   return p;
// }
processImage("mid.gif", 1)