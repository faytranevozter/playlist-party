import { Prisma, PrismaClient, SearchResult } from "@prisma/client";
import {
  SearchSong,
  convertDuration,
  convertVideoIDtoMusicID,
  formatDuration,
} from "../util/youtube";

export interface SearchResultWeb {
  musicID: string;
  title: string;
  artist: string;
  thumbnail: string;
  album?: string;
  duration: string;
  total_play: string;
}

export const SearchWordApi = async (
  query: string,
): Promise<SearchResultWeb[]> => {
  const res = await SearchSong(query);

  return res.map((row): SearchResultWeb => {
    return {
      musicID: convertVideoIDtoMusicID(row.videoId),
      title: row.name || "",
      thumbnail: row.thumbnails[0].url || "",
      artist: row.artist.name,
      album: row.album?.name,
      duration: formatDuration(row.duration || 0),
      total_play: "",
    };
  });
};

export const addSearchResults = async (
  prisma: PrismaClient,
  searchResults: SearchResultWeb[],
): Promise<void> => {
  for (let i = 0; i < searchResults.length; i++) {
    const sr = searchResults[i] as Prisma.SearchResultCreateInput;
    try {
      // console.log("musicID", sr);
      await prisma.searchResult.create({
        data: {
          musicID: sr.musicID,
          title: sr.title,
          artist: sr.artist,
          thumbnail: sr.thumbnail,
          album: sr.album,
          duration: sr.duration,
          duration_second: convertDuration(sr.duration),
          total_play: sr.total_play,
        },
      });
    } catch (err: any) {
      console.error("failed to insert search result:", sr.title);
    }
  }
};

export const getSearchResult = async (
  prisma: PrismaClient,
  musicID: string,
): Promise<false | SearchResult> => {
  const res = await prisma.searchResult.findFirst({
    where: {
      musicID,
    },
  });

  if (!res) {
    return false;
  }

  return res;
};
