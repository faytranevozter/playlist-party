import dayjs, { Dayjs } from "dayjs";
import { updateIsPlaying, updatePlayedAt } from "../repository/queue";
import { getSubscribedList } from "../repository/subscriber";
import { useBot } from "../libs/bot";
import { PrismaClient } from "@prisma/client";
import ytdl from "ytdl-core";

const prisma = new PrismaClient();

const subscribersID: string[] = [];
let expiredCache: Dayjs = dayjs();

const bot = useBot();

const sendMessageToSubscriber = async (message: string) => {
  if (expiredCache.isBefore(dayjs())) {
    const subscribers = await getSubscribedList(prisma);
    subscribersID.length = 0;
    for (let i = 0; i < subscribers.length; i++) {
      const s = subscribers[i];
      subscribersID.push(s.chatID.toString());
    }
    expiredCache = dayjs().add(5, "minutes");
  }
  subscribersID.forEach((chatID) => {
    bot.telegram.sendMessage(chatID, message);
  });
};

const sendNotificationCurrentPlaying = async () => {
  console.log(
    `PlayCurrentSong Playing ${globalThis.currentQueue.title} by ${globalThis.currentQueue.artist}`,
  );
  await sendMessageToSubscriber(
    `Playing ${globalThis.currentQueue.title} by ${globalThis.currentQueue.artist} [${globalThis.currentQueue.duration}]`,
  );
};

const PlayCurrentSong = async () => {
  // get from ytdl
  const info = await ytdl.getInfo(
    `https://music.youtube.com/${globalThis.currentQueue.musicID}`,
  );

  const { getSuggestions } = await import("node-youtube-music");
  const suggestions = await getSuggestions(info.videoDetails.videoId);
  // console.log(info);
  console.log("suggestions");
  console.log(suggestions);
  const audio = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
  });
  globalThis.socket.emit("play", {
    queue: globalThis.currentQueue,
    info: audio.url,
  });

  // update is playing (global variable)
  statusPlay = "playing";

  // update db
  if (globalThis.currentQueue.id > 0) {
    await updateIsPlaying(prisma, globalThis.currentQueue, true);
    await updatePlayedAt(prisma, globalThis.currentQueue);
  }

  // send notification
  sendNotificationCurrentPlaying();
};

export { sendNotificationCurrentPlaying, PlayCurrentSong };
