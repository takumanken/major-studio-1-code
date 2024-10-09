import fs from 'fs';

// Load and parse the JSON file
const rawData = fs.readFileSync('data/portraits_painting.json', 'utf-8');
const originalDataArray = JSON.parse(rawData);

// Function to extract the desired fields from each data object
function extractData(data) {
  const freetext = data.content?.freetext;

  // Extract sitter names
  const sitterNames = freetext?.name
    ? freetext.name.filter(item => item.label === 'Sitter').map(item => item.content.split(',')[0])
    : [];

  // Extract object type
  const objectType = freetext?.objectType
    ? freetext.objectType.map(item => item.content).join(', ')
    : '';

  // Extract image link
  const imageLink = data.content?.descriptiveNonRepeating?.online_media?.media
    ? data.content.descriptiveNonRepeating.online_media.media[0]?.content
    : '';

  // Extract thumbnail link
  const thumbnailLink = data.content?.descriptiveNonRepeating?.online_media?.media
    ? data.content.descriptiveNonRepeating.online_media.media[0]?.thumbnail
    : '';

  // Exclude if there are multiple sitters or no sitters
  if (sitterNames.length > 1 || sitterNames.length === 0) {
    return null;
  }
  
  // Exclude if object type is not 'Painting'
  if (objectType !== 'Painting') {
    return null;
  }
  
  // Exclude if imageLink or thumbnailLink is missing
  if (!imageLink || !thumbnailLink) {
    return null;
  }

  // Extract topics related to the sitter
  const topics = freetext?.topic
    ? freetext.topic
        .map(item => item.content)
        .filter(topic => sitterNames.some(name => topic.startsWith(`${name}:`)))
        .map(topic => {
          const name = sitterNames.find(name => topic.startsWith(`${name}:`));
          return name ? topic.replace(`${name}:`, '').trim() : topic;
        })
    : [];

  // Determine the sitter's sex and extract remaining topics
  const sex = topics.find(topic => topic === 'Male' || topic === 'Female') || '';
  const remainingTopics = topics.filter(topic => topic !== 'Male' && topic !== 'Female');

  // Exclude if keywords (remaining topics) are empty
  if (remainingTopics.length === 0) {
    return null;
  }

  // Deduplicate categories from remaining topics
  const dedupedCategories = [...new Set(remainingTopics.map(topic => topic.split('\\')[0]))];

  // Extract date
  const date = freetext?.date
    ? freetext.date.map(item => item.content).join(', ')
    : '';

  // Extract sitter period
  const sitterPeriod = freetext?.name
    ? freetext.name.filter(item => item.label === 'Sitter').map(item => item.content.split(',')[1]?.trim()).join(', ')
    : '';

  // Extract artist name
  const artistName = freetext?.name
    ? freetext.name.filter(item => item.label === 'Artist').map(item => item.content.split(',')[0]).join(', ')
    : '';

  // Extract notes
  const notes = freetext?.notes ? freetext.notes.map(item => item.content) : [];

  // Construct the extracted data object
  return {
    id: data.id,
    title: data.title,
    objectType: objectType,
    date: date,
    Name: sitterNames[0],
    Period: sitterPeriod,
    Sex: sex,
    Categories: dedupedCategories,
    notes: notes,
    keywords: remainingTopics,
    artistName: artistName,
    isSelfPortrait: data.title.includes('Self-Portrait'),
    imageLink: imageLink,
    thumbnailLink: thumbnailLink,
    detailLink: data.content?.descriptiveNonRepeating?.record_link,
  };
}

// Extract the desired information from each object in the array, excluding null values
const extractedDataArray = originalDataArray
  .map(extractData)
  .filter(item => item !== null);

// Write the extracted data to a new JSON file
fs.writeFileSync('./data/transformed_data.json', JSON.stringify(extractedDataArray, null, 2), 'utf-8');

// Output the extracted data
console.log('Extracted data has been written to transformed_data.json');
console.log(`Number of records after transformation: ${extractedDataArray.length}`);