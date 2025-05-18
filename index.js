import { fetchCurrentlyWatchingList } from "./api/MyAnimeList.js";
import { fetchNextAiringEp } from "./api/AniList.js";
import rateLimit from 'express-rate-limit'; 
import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const { PORT, API_KEY, FRONTEND_URL } = process.env;
if (!PORT || !API_KEY || !FRONTEND_URL) {
  throw new Error('Missing required environment variables!');
}

const requireApiKey = (req, res, next) => {
  const key = req.header('x-api-key');
  if (key && key === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

const app = express();
app.use(cors({
  origin: FRONTEND_URL,
}));
app.use(requireApiKey)
app.use(limiter)

// Default end point
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Next-Ep-Backend!" });
});

// returns "currently watching" list for the MyAnimeList profile with username
app.get("/watchList/:username",  async (req, res) => {
  let username = req.params.username;
  let watchList =  await fetchCurrentlyWatchingList(username);

  res.json(watchList);
});

// returns next air date of anime based on MAL id
app.get("/nextEp/:id", async (req, res) => {
  let id = req.params.id;
  let nextEp = await fetchNextAiringEp(id)

  res.json(nextEp);
});

// returns array of next episodes for anime in users watch list
// [{
//   id
//   imageUrl
//   nextEp { 
//     airingAt
//     episode
//   }
//   title
// }]
app.get("/watchListNextEps/:username", async (req, res) => {
  let username = req.params.username;
  let watchList = await fetchCurrentlyWatchingList(username);
  if(!watchList) return res.json(watchList)
  
  let watchListNextEps = await Promise.all(
    watchList
      .filter(anime => anime.airing_status === 1)
      .map(async anime => {
        var nextEp = await fetchNextAiringEp(anime.id)
        return nextEp
      })
  );

  let filterEps = watchListNextEps.filter(nextEp => nextEp)
  res.json(filterEps.length === 0 ? null : filterEps)
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});