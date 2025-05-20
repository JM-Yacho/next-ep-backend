import { fetchCurrentlyWatchingList } from "./api/MyAnimeList.js";
import { fetchNextAiringEp } from "./api/AniList.js";
import rateLimit from 'express-rate-limit'; 
import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const { ALT_API_KEY, PORT, FRONTEND_API_KEY, FRONTEND_URL } = process.env;
if (!ALT_API_KEY || !PORT || !FRONTEND_API_KEY || !FRONTEND_URL) {
  throw new Error('Missing required environment variables!');
}

const corsPolicy = (req, res, next) => {
  if (req.path === '/') {
    return next();
  }

  cors({
    origin: FRONTEND_URL,
  })(req, res, next);
}

const requireApiKey = (req, res, next) => {
  const key = req.header('x-api-key');
  if (key) {
    switch (req.path) {
      case '/':
        if (key === ALT_API_KEY) return next()
        break
      default:
        if (key === FRONTEND_API_KEY) return next()
        break
    }
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

const rateLimits = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

const app = express();
app.set('trust proxy', 1);
app.use(rateLimits);
app.use(corsPolicy);
app.use(requireApiKey);

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
app.get("/nextEp/:mal_id", async (req, res) => {
  let mal_id = req.params.mal_id;
  let nextEp = await fetchNextAiringEp(mal_id)
  res.json(nextEp);
});

// returns array of next episodes for anime in users watch list
// [{
// id
// title_romaji
// title_english
// airing_at
// num
// image_url
// }]
app.get("/watchListNextEps/:username", async (req, res) => {
  let username = req.params.username;
  let watchList = await fetchCurrentlyWatchingList(username);
  if(!watchList || watchList.length === 0) return res.json(watchList)
  
  let watchListNextEps = await Promise.all(
    watchList
      .filter(anime => anime.airing_status === 1)
      .map(async anime => {
        var nextEp = await fetchNextAiringEp(anime.mal_id)
        return nextEp
      })
  );

  let filteredEps = watchListNextEps.filter(nextEp => nextEp)
  res.json(filteredEps)
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});