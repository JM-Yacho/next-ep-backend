import { fetchCurrentWatchList } from "./api/MyAnimeList.js";
import { fetchAirSchedule } from "./api/AniList.js";
import express from "express";
import cors from 'cors';

const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;

const requireApiKey = (req, res, next) => {
  const key = req.header('x-api-key');
  if (key && key === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
};

const app = express();
app.use(cors());
app.use(requireApiKey)

// Default end point
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Next-Ep-Backend!" });
});

// returns "currently watching" list for the MyAnimeList profile with username
app.get("/watchList/:username",  async (req, res) => {
  let username = req.params.username;
  let currentWatchList =  await fetchCurrentWatchList(username);

  res.json(currentWatchList);
});

// returns next air date of anime based on MAL id
app.get("/nextAiringEp/:id", async (req, res) => {
  let id = req.params.id;
  let nextAiringEp = await fetchAirSchedule(id);

  res.json(nextAiringEp);
});

// returns the air schedule of anime in current watch list
app.get("/watchListNextEps/:username", async (req, res) => {
  let username = req.params.username;
  let watchList = await fetchCurrentWatchList(username);
  let watchListNextEps = [];

  if(watchList) {
    watchListNextEps = await Promise.all(await watchList.map(async anime => {
      currentAirSchedule = await fetchAirSchedule(anime.id)

      return {
        ...anime,
        nextEp: currentAirSchedule ? currentAirSchedule[currentAirSchedule.length - 1] : null
      }
    }));
  }

  res.json(watchListNextEps.filter(anime => anime.nextEp));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});