import express from "express";
import { PrismaClient } from "@prisma/client";

import { getQueue } from "./repository/queue";

import { Player } from "./events/player";
import { useBot } from "./libs/bot";
import { appDomain, port } from "./config/config";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

(async () => {
  const prisma = new PrismaClient();

  // init BOT
  const bot = useBot();
  bot.start((ctx) => ctx.reply("Welcome"));

  const app = express();

  // set webhook
  app.use(
    await bot.createWebhook({
      domain: appDomain,
    }),
  );

  bot.telegram.setMyCommands([
    { command: "play", description: "Play a music" },
    { command: "pause", description: "You know this" },
    { command: "vote_next", description: "Voting to play next" },
    { command: "queue", description: "Queue list" },
    { command: "info", description: "Get info current playing" },
    { command: "lyrics", description: "Get lyrics from current playing" },
    { command: "subscribe", description: "Subscribe chat to bot" },
    { command: "unsubscribe", description: "Unsubscribe chat to bot" },
  ]);

  new Player();

  // define status player
  globalThis.votePlayNextUsers = [];
  globalThis.votePlayNextMinimum = 5;
  globalThis.votePlayNextCount = 0;
  globalThis.statusPlay = "idle";

  // get queue if exist
  const [exist, lastQueue] = await getQueue(prisma);
  if (!exist) {
    globalThis.currentQueue = {
      id: 0,
      musicID: "watch?v=paCm-W8EURI",
      title: "On The Night Like This",
      artist: "Mocca",
      thumbnail:
        "https://lh3.googleusercontent.com/iEZF6i3V3KL02o0DrmOy4ZkD0BCW8pUy08X1w2UvkcwcdMZiFXxl8wsL4JTBqgIVD0wG56lp6Z6F10h6=w120-h120-l90-rj",
      album: "Friends",
      year: "",
      duration: "1:22",
      duration_second: 82,
      total_play: "1.3M plays",
      playedAt: null,
      finishedAt: null,
      isPlaying: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } else if (lastQueue !== null) {
    globalThis.currentQueue = lastQueue;
  }

  globalThis.currentTitle = null;
  globalThis.newTitle = null;

  app.use(
    cors({
      origin: "*",
    }),
  );

  // console.log(__dirname, path.join(__dirname, "../public/index.html"));
  app.get("/", (req, res) => {
    res.send("Yuuuu!!!");
  });

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    globalThis.socket = socket;
    console.log("a user connected");

    socket.on("play", (msg) => {
      console.log("msg", msg);
    });
  });

  // setTimeout(() => {
  //   console.log(globalThis.socket);
  //   globalThis.socket.emit("play", { a: "v" });
  // }, 5000);

  // bot.launch();
  server.listen(port, () => console.log("Listening on port", port));

  // Enable graceful stop
  process.once("SIGINT", async () => {
    console.log("SIGINT");
    await prisma.$disconnect();
    bot.stop("SIGINT");
  });

  process.once("SIGTERM", async () => {
    console.log("SIGTERM");
    await prisma.$disconnect();
    bot.stop("SIGTERM");
  });
})();
