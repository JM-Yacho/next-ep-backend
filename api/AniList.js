import { GraphQLClient } from 'graphql-request';

const aniListUrl = 'https://graphql.anilist.co'
const client = new GraphQLClient(aniListUrl);
const NODE_ENV = process.env.NODE_ENV || 'development';

async function fetchFromAniList(query, variables) {
  let response = null;

  try {
    response = await client.request(query, variables)
    // console.log('Data fetched:', response);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching from AniList:`, error.message);
    if (NODE_ENV !== 'production') {
        console.error(error.stack);
    }
  }
  
  return response;
}

export async function fetchNextAiringEp(mal_id) {
  const query = `
    query ($mal_id: Int) { # Define which variables will be used in the query (id)
      Media (idMal: $mal_id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        title {
          title_romaji :romaji
          title_english :english
        }
        coverImage {
          image_url: extraLarge 
        }
        nextAiringEpisode {
          airing_at: airingAt,
          num: episode
        }
      }
    }
  `;

  let variables = {
    mal_id: mal_id
  };

  let response = await fetchFromAniList(query, variables);
  if(response?.Media?.nextAiringEpisode?.airing_at) {
    return {
      mal_id,
      ...response.Media.title,
      ...response.Media.nextAiringEpisode,
      ...response.Media.coverImage
    }
  }

  return null;
}

// console.log(await fetchNextAiringEp(51818))
// console.log(await fetchNextAiringEp(49220))