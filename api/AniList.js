import { GraphQLClient } from 'graphql-request';

const aniListUrl = 'https://graphql.anilist.co'
const client = new GraphQLClient(aniListUrl);

async function fetchFromAniList(query, variables) {
  let results = {};

  try {
    results = await client.request(query, variables)
    // console.log('Data fetched:', results);
  } catch (error) {
    console.error('Error:', error);
  }
  
  return results;
}

export async function fetchAirSchedule(id) {
  const query = `
    query ($idMal: Int) { # Define which variables will be used in the query (id)
      Media (idMal: $idMal, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        airingSchedule {
          nodes {
            airingAt,
            episode
            #,
            #media {
            #  title {
            #    english
            #  }
            #}
          }
        }
      }
    }
  `;

  let variables = {
    idMal: id
  };

  let results = await fetchFromAniList(query, variables);

  try {
    let { Media: { airingSchedule: { nodes } } } = results;
    return nodes;
  }
  catch {
    return {};
  }
}

console.log(await fetchAirSchedule(49220))