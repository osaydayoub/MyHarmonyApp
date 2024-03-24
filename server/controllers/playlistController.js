import dotenv from "dotenv";
import axios from "axios";
import { playlistData } from "../constants/playlistData.js";
import translateText3Lang from "../utils/translateText3Lang.js";
import getSongNameFromTitle from "../utils/getSongNameFromTitle.js";
import mongoose from "mongoose";
import Playlist from "../models/Playlist.js";

dotenv.config();

// GET Playlist data
export const getPlaylistData = async (req, res) => {
  const { id, lang } = req.query;
  if (!id) {
    res.status(400).send("ERROR: id is required");
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    res.status(400).send("ERROR: YOUTUBE_API_KEY is required");
  }

  try {
    // Check if the playlist data already exists in the database
    const playlist = await Playlist.findOne({ playlistId: id });

    if (playlist) {
      // Return the data from the database
      res.status(200).json(playlist.items);
    } else {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id}&maxResults=10&key=${YOUTUBE_API_KEY}`;
      const playlistItemsResponse = await axios.get(url);

      if (
        !playlistItemsResponse.data ||
        playlistItemsResponse.data.items.length === 0
      ) {
        throw new Error("Playlist not found or empty");
      }

      const itemsWithProfilePic = await Promise.all(
        playlistItemsResponse.data.items.map(async (item) => {
          const profilePicUrl = await fetchChannelProfilePic(
            item.snippet.videoOwnerChannelId
          );
          const songName = getSongNameFromTitle(item.snippet.title, lang);
          const translatTo3 = await translateText3Lang(songName);
          return {
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            songName3Lang: translatTo3,
            thumbnailUrl: item.snippet.thumbnails.standard.url,
            channelTitle: item.snippet.videoOwnerChannelTitle,
            channelId: item.snippet.videoOwnerChannelId,
            profilePicUrl: profilePicUrl,
          };
        })
      );

      // Save the playlist data to the database
      const newPlaylist = new Playlist({
        playlistId: id,
        items: itemsWithProfilePic,
      });
      await newPlaylist.save();

      res.status(200).json(itemsWithProfilePic);
    }
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    res.status(500).send("Internal Server Error");
  }
};

// GET profilePicUrl of the channel to be in place of the artist picture
export const getChannelProfilePic = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("ERROR: Channel ID is required");
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    return res.status(400).send("ERROR: YOUTUBE_API_KEY is required");
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await axios.get(url);

    if (!channelResponse.data || channelResponse.data.items.length === 0) {
      throw new Error("Channel not found");
    }

    const profilePicUrl =
      channelResponse.data.items[0].snippet.thumbnails.default.url;

    res.status(200).json({ profilePicUrl });
  } catch (error) {
    console.error("Error fetching channel profile picture:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getAllPlaylistsData = (req, res) => {
  const playlists = playlistData;
  res.send(playlists);
};

const fetchChannelProfilePic = async (channelId) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is required");
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await axios.get(url);

    if (!channelResponse.data || channelResponse.data.items.length === 0) {
      throw new Error("Channel not found");
    }

    return channelResponse.data.items[0].snippet.thumbnails.default.url;
  } catch (error) {
    console.error("Error fetching channel profile picture:", error);
    throw error;
  }
};
