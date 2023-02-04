const axios = require('axios');

const malUrl = 'https://myanimelist.net'

async function fetchFromMAL(url) {
    let htmlBody = await axios({
        'method': 'GET',
        'url': url
    })
    .then(response => {
        return response.data
    })
    .catch(error => {
        console.error(error.response.status)
        console.error(error.message)
        return ''
    });
    return htmlBody;
}

function searchHtml(html, leftBound, rightBound) {
    let patternString = `${leftBound}(.*)${rightBound}`
    let animeListRegex = new RegExp(patternString, 'g')
    let animeListMatches = html.match(animeListRegex)
    if(!animeListMatches || animeListMatches.length < 1)
        return ''

    let animeList = animeListMatches[0]
        .replace(leftBound, '')
        .replace(rightBound, '')
        .replace(/&quot;/g,'"')
        .replace(/&#039;/g, "'");
    return animeList
}

async function fetchCurrentWatchList(username) {
    let url = `${malUrl}/animelist/${username}?status=1`
    let returnedHtml = await fetchFromMAL(url)
    if(!returnedHtml)
        return []
        
    let leftBound = 'data-items="'
    let rightBound = '" data-broadcasts='
    let watchListHtml = searchHtml(returnedHtml, leftBound, rightBound)
    if(!watchListHtml)
        return []

    try {
        let watchListJson = JSON.parse(watchListHtml)
        let filteredWatchList = watchListJson.map(anime => ({
            id: anime.anime_id,
            pictureUrl: anime.anime_image_path,
            title: anime.anime_title_eng
        }))
        return filteredWatchList
    }
    catch (err) {
        console.error(err);
        return []
    }
}

// console.log(await fetchCurrentWatchList('IschaBoi'))

module.exports = {fetchCurrentWatchList};