const malApi = require("./api/MyAnimeList.js");
const aniListApi = require("./api/AniList.js");
const express = require("express");
const cors = require('cors');

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());

// Default end point
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Next-Ep-Backend!" });
});

// watchList endpoint
// returns "currentyl watching" list for the MyAnimeList with username
app.get("/watchList/:username",  async (req, res) => {
  let username = req.params.username;
  let currentWatchList =  await malApi.fetchCurrentWatchList(username);

  res.json(currentWatchList);
});

// nextAirDate endpoint
// returns next air date of anime based on MAL id
app.get("/nextAirDate/:id", async (req, res) => {
  let id = req.params.id;
  let nextAirDate = await aniListApi.fetchNextAiringEp(id);

  res.json(nextAirDate);
});

// watchListNextEps endpoint
// returns array with in style [{id, picturUrl, title, nextEp: {airingAt, episode}}...]
app.get("/watchListNextEps/:username", async (req, res) => {
  let username = req.params.username;
  let watchList = await malApi.fetchCurrentWatchList(username);
  let watchListNextEps;
  if(watchList) {
    watchListNextEps = await Promise.all(await watchList.map(async anime => {
      return {...anime, nextEp: await aniListApi.fetchNextAiringEp(anime.id)}
    }));
    watchListNextEps = watchListNextEps.filter(anime => anime.nextEp);
  }
  else {
    watchListNextEps = [];
  }

  res.json(watchListNextEps);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});