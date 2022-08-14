const Queue = require("bull");

const { v4: uuidv4 } = require("uuid");

const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

// redis://default:QUuFnSn9AwyU88tjfyF9@containers-us-west-73.railway.app:5878
//

const videoQueue = new Queue(
  "video transcoding",
  "redis://default:QUuFnSn9AwyU88tjfyF9@containers-us-west-73.railway.app:5878"
);

videoQueue.process(2, (job, done) => {
  console.log(job.data.video);
  const ffmpeg = require("fluent-ffmpeg")()
    .setFfprobePath(ffprobe.path)
    .setFfmpegPath(ffmpegInstaller.path);
  return new Promise((resolve, reject) => {
    ffmpeg
      .input(job.data.video)
      .outputOptions([
        "-pix_fmt yuv420p",
        "-c:v libx264",
        "-movflags +faststart",
        "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
      ])
      .noAudio()
      .output(`${uuidv4()}.mp4`)
      .on("end", () => {
        resolve();
      })
      .on("error", (e) => {
        return reject(new Error(e));
      })
      .run();
  });
});

async function main() {
  const numberOfRuns = [...Array(10)];

  numberOfRuns.map(() => videoQueue.add({ video: "./big.gif" }));
}

main()
  .then()
  .catch(() => process.exit(1));
