const ffmpeg = require("fluent-ffmpeg");

ffmpeg(process.argv[2])
  .format("mp4")
  .on("end", () => {
    console.log("done🎉");
  })
  .save(process.argv[3]);
