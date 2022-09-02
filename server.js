const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const { Web3Storage } = require("web3.storage");

const videoQueue = require("./app");

const storage = new Web3Storage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFGMGY1MjdhMTIwMGI1ZjZhRmQ3Y0NGMUUyQzI2ODk3QjI0MkI1Y2QiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjA5NDEwMTI3NjQsIm5hbWUiOiJ0ZXN0In0.K1utxB6HiHOapJxBfMdoJahWb6ZsaoEWOsTkDWBZups",
});

const f = require("fastify")({
  logger: false,
  bodyLimit: 2000000,
});

f.get("/", function (_, reply) {
  reply.send({ hello: "world" });
});

f.post("/upload", async (request, reply) => {
  const { gifData } = request.body;

  if (typeof gifData === "undefined" || typeof gifData !== "string" || gifData.length < 1) {
    return reply.code(400);
  }
  const buff = Buffer.from(gifData, "base64");

  const fileId = crypto.randomUUID();
  fs.writeFileSync(path.resolve(__dirname, `./tmp/${fileId}.gif`), buff);

  videoQueue.add({ video: `./tmp/${fileId}.gif` });

  // console.log(`Uploading file`);
  // const cid = await storage.put(files);
  // console.log("Content added with CID:", cid);
});

f.listen({ port: process.env.PORT || 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
