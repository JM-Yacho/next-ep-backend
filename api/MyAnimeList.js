import axios from 'axios';

const malBaseUrl = 'https://myanimelist.net'

async function fetchFromMAL(url) {
    try {
        const response = await axios.get(url);
        return response.data
    } catch (error) {
        console.error('Error:', error.message, '|', error.config?.url)
        return ''
    }
}

function searchHtml(html, leftBound, rightBound) {
    let pattern = `${leftBound}(.*)${rightBound}`
    let reg = new RegExp(pattern, 'g')
    let matches = html.match(reg)
    if(!matches || matches.length < 1)
        return ''

    let unescapedMatches = matches[0]
        .replace(leftBound, '')
        .replace(rightBound, '')
        .replace(/&quot;/g,'"')
        .replace(/&#039;/g, "'");
    return unescapedMatches
}

async function fetchAndSearchHtml(url, leftBound, rightBound) {
    let malHtml = await fetchFromMAL(url)
    
    if(!malHtml)
        return []
        
    let foundHtml = searchHtml(malHtml, leftBound, rightBound)
    if(!foundHtml)
        return []

    return foundHtml
}

export async function fetchCurrentWatchList(username) {
    let leftBound = 'data-items="'
    let rightBound = '" data-broadcasts='
    let url = `${malBaseUrl}/animelist/${username}?status=1`
    let watchListHtml = await fetchAndSearchHtml(url, leftBound, rightBound)
    if(!watchListHtml)
        return []

    try {
        let watchListJson = JSON.parse(watchListHtml)
        // console.log(watchListJson[0])
        let filteredWatchList = watchListJson.map(anime => ({
            id: anime.anime_id,
            imageUrl: anime.anime_image_path,
            title: anime.anime_title_eng
            // airingStatus: anime.anime_airing_status
        }))
        // console.log(filteredWatchList)
        return filteredWatchList
    }
    catch (err) {
        console.error(err);
        return []
    }
}

console.log(await fetchCurrentWatchList('IschaBoi'))