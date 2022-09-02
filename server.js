const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const videoQueue = require("./app");

const f = require("fastify")({
  logger: false,
});

f.get("/", function (_, reply) {
  reply.send({ hello: "world" });
});

f.post("/upload", async (request, reply) => {
  const { gifData } = request.body;

  if (typeof gifData === "undefined" || typeof gifData !== "string" || gifData.length < 1) {
    return reply.code(400);
  }
  const bitmap = fs.readFileSync(path.resolve(__dirname, "./tmp/hi-res.gif"), {
    encoding: "base64",
  });

  const buff = Buffer.from(bitmap, "base64");

  const fileId = crypto.randomUUID();
  fs.writeFileSync(path.resolve(__dirname, `./tmp/${fileId}.gif`), buff);

  videoQueue.add({ video: `./tmp/${fileId}.gif` });
});

f.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
