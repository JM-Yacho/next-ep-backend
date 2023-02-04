const gql = require('graphql-request');

const aniListUrl = 'https://graphql.anilist.co'

async function fetchFromAniList(query, variables) {
  let results = {};

  await gql.request(aniListUrl, query, variables)
    .then((res) => {
      results = res
    })
    .catch((error) => {
      console.error(error.response.status)
      console.error(error.response.errors)
    });
  
  return results;
}

async function fetchNextAiringEp(id) {
  const query = gql.gql`
    query ($idMal: Int) { # Define which variables will be used in the query (id)
      Media (idMal: $idMal, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        nextAiringEpisode {
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
  `;

  let variables = {
    idMal: id
  };

  let results = await fetchFromAniList(query, variables);

  try {
    let { Media: { nextAiringEpisode } } = results;
    return nextAiringEpisode;
  }
  catch {
    return {};
  }
}

// console.log(await fetchNextAirDate(49220))

module.exports = {fetchNextAiringEp}