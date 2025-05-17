import axios from 'axios';

const malBaseUrl = 'https://myanimelist.net'

async function fetchFromMAL(url) {
    try {
        const response = await axios.get(url);
        return response.data
    } catch (error) {
        console.error('Error:', error.stack)
        return null
    }
}

function searchHtml(html, leftBound, rightBound) {
    let pattern = `${leftBound}(.*)${rightBound}`
    let reg = new RegExp(pattern, 'g')
    let matches = html.match(reg)
    if(!matches || matches.length < 1)
        return null

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
        return null
        
    let foundHtml = searchHtml(malHtml, leftBound, rightBound)
    if(!foundHtml)
        return null
    
    return foundHtml
}

export async function fetchCurrentlyWatchingList(username) {
    let leftBound = 'data-items="'
    let rightBound = '" data-broadcasts='
    let url = `${malBaseUrl}/animelist/${username}?status=1`
    let watchListHtml = await fetchAndSearchHtml(url, leftBound, rightBound)
    if(!watchListHtml)
        return null

    try {
        let watchList = JSON.parse(watchListHtml)
                            .map(anime => ({
                                id: anime.anime_id,
                                airing_status: anime.anime_airing_status
                            }))
        
        if(watchList.length == 0) return null
        
        return watchList
    }
    catch (err) {
        console.error(err);
        return null
    }
}

// console.log(await fetchCurrentlyWatchingList(''))