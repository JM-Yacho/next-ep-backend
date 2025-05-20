import axios from 'axios';

const malBaseUrl = 'https://myanimelist.net'
const NODE_ENV = process.env.NODE_ENV || 'development';

async function fetchFromMAL(url) {
    try {
        const response = await axios.get(url);
        return response.data
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching from MAL:`, error.message);
        if (NODE_ENV !== 'production') {
            console.error(error.stack);
        }
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
        return []
    
    return foundHtml
}

export async function fetchCurrentlyWatchingList(username) {
    let leftBound = 'data-items="'
    let rightBound = '" data-broadcasts='
    let url = `${malBaseUrl}/animelist/${username}?status=1`
    let watchListHtml = await fetchAndSearchHtml(url, leftBound, rightBound)
    if(!watchListHtml || watchListHtml.length < 1)
        return watchListHtml

    try {
        let watchList = JSON.parse(watchListHtml)
                            .map(anime => ({
                                mal_id: anime.anime_id,
                                airing_status: anime.anime_airing_status
                            }))
        
        return watchList
    }
    catch (err) {
        console.error(err);
        return null
    }
}

// console.log(await fetchCurrentlyWatchingList(''))