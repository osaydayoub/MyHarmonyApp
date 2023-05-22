import asyncHandler from "../middleware/asyncHandler.js";
import TopSongs from "../models/TopSongs.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import scrapeTopArabicSongs from "../scrapping/scrappingTopArabicSongs.js";
import scrapeTopHebrewSongs from "../scrapping/scrappingTopHebrewSongs.js";
import { getOrCreateSongAndReturn } from "./songsController.js";
import { dummySongsArray } from "../utils/dummySongResults.js";

const getOrCreateAllTopSongs = async (language) => {
        let scrapedTopSongs
    if (language === 'hebrew'){
        scrapedTopSongs = JSON.parse(await scrapeTopHebrewSongs())
    }
    if (language === 'arabic'){
        scrapedTopSongs = JSON.parse(await scrapeTopArabicSongs())
    }
    //scrapedTopArabicSongs should be translated and massaged, to get an array of top songs. Each song should be an object with the exact structure and information in the model (Song.js)
    const massagedResults = dummySongsArray
    const createdSongsIdArray = []
   for (const result of massagedResults){
    const song = await getOrCreateSongAndReturn(result)
    createdSongsIdArray.push(song._id)
   }
   return createdSongsIdArray
  };

// @desc    Create top songs
//@route    POST /api/v1/harmony/topSongs
// @access  Public

const createTopSongs = asyncHandler(async (req, res, next) => {
    const {language} = req.body
    const songs = await getOrCreateAllTopSongs(language)
    if (!songs) {
      return next(new ErrorResponse(`Error while getting or creating top songs from scraped data`));
    }
    const topSongs = TopSongs.create({language, songs})
    if (!topSongs) {
      return next(new ErrorResponse(`Server error! Error while creating topSongs`));
    }
    res.status(200).json({
      success: true,
      data: topSongs,
    });
  });