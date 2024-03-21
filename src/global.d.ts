/* eslint-disable no-var */
import { Queue } from "@prisma/client";
import { Telegraf } from "telegraf";
import { Socket } from "socket.io";
export {};
declare global {
  // var playerPage: Page;
  var statusPlay: "playing" | "paused" | "idle";
  var currentQueue: Queue;
  // var browsers: Browser;
  var bot: Telegraf;
  // var playerTimer: NodeJS.Timeout;
  var currentTitle: string | null;
  var newTitle: string | null;
  var timer: NodeJS.Timeout;
  var votePlayNextUsers: number[];
  var votePlayNextMinimum: number;
  var votePlayNextCount: number;
  var socket: Socket;
}
