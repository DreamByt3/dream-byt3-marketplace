// Constants for points calculation
const POINTS_PER_LISTING = 25;
const POINTS_PER_BID = 25;
const POINTS_PER_MINUTE = 0.01;
const POINTS_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Track active listings and bids
let activeListings = {};
let activeBids = {};

// Assuming dataFeed has a function to fetch the floor price for a particular NFT ID
async function getLatestPrice(pudgyPenguinsId) {

  try {
    const floorPrice = await dataFeed.getLatestPrice(pudgyPenguinsId);
    return floorPrice;
  } catch (error) {
    console.error("Failed to get floor price for NFT ID", nftId, error);
    throw new Error(`Cannot retrieve floor price for NFT ID ${nftId}`);
  }
}


async function updatePoints(user, action, pudgyPenguinsId, price) {
  // Get the floor price of the NFT Collection
  const floorPrice = await getLatestPrice(pudgyPenguinsId);

  // Calculate the acceptable price range
  const minPrice = floorPrice * 0.8;
  const maxPrice = floorPrice * 1.2;

  // Check if the user's price is within the acceptable range
  if (price >= minPrice && price <= maxPrice) {
    // Award points for listing or bidding
    let points;
    if (action === 'listing') {
      points = POINTS_PER_LISTING;
      activeListings[pudgyPenguinsId] = { user, timestamp: Date.now() };
    } else if (action === 'bidding') {
      points = POINTS_PER_BID;
      activeBids[pudgyPenguinsId] = { user, timestamp: Date.now() };
    }

    // Update the user's points in the database
    await updateUserPoints(user, points);
  }
}

// Function to award points for active listings and bids
setInterval(async () => {
  const now = Date.now();

  for (const pudgyPenguinsId in activeListings) {
    const { user, timestamp } = activeListings[pudgyPenguinsId];
    const minutes = (now - timestamp) / 60000;
    if (minutes >= 10) {
      const points = POINTS_PER_MINUTE;
      await updateUserPoints(user, points);
      activeListings[pudgyPenguinsId].timestamp = now;
    }
  }

  for (const pudgyPenguinsId in activeBids) {
    const { user, timestamp } = activeBids[pudgyPenguinsId];
    const minutes = (now - timestamp) / 60000;
    if (minutes >= 10) {
      const points = POINTS_PER_MINUTE;
      await updateUserPoints(user, points);
      activeBids[pudgyPenguinsId].timestamp = now;
    }
  }
}, 60000); // Run every minute

// Function to reset points every 24 hours
setInterval(async () => {
  // Reset points for all users
  await resetUserPoints();

  // Reset active listings and bids
  activeListings = {};
  activeBids = {};
}, POINTS_RESET_INTERVAL);

// Connect to the Chainlink NFT Floor Price Data Feed for Pudgy Penguins

const dataFeed = new ethers.0xc2f84ed8a4fAE9E397Ae036aDBEa7F51ed2F3C1e(dataFeedABI, provider);

// Get the floor price of an NFT (Pudgy Penguins) collection
const floorPrice = await dataFeed.getLatestPrice();

async function updatePoints(user, action, pudgyPenguinsId, price) {
  // Get the floor price of the NFT
  const floorPrice = await getLatestPrice(pudgyPenguinsId);

  // Calculate the acceptable price range
  const minPrice = floorPrice * 0.8;
  const maxPrice = floorPrice * 1.2;

  // Check if the user's price is within the acceptable range
  if (price >= minPrice && price <= maxPrice) {
    // Calculate the points to award
    let points;
    if (action === 'listing') {
      points = calculateListingPoints(price, floorPrice);
    } else if (action === 'bidding') {
      points = calculateBiddingPoints(price, floorPrice);
    }

    // Update the user's points in the database
    await updateUserPoints(user, points);
  }
}

// Function to calculate the points for a listing
function calculateListingPoints(price, floorPrice) {
  const points = (price - floorPrice) * POINTS_PER_LISTING;
  return points;
}

// Function to calculate the points for a bidding
function calculateBiddingPoints(price, floorPrice) {
  const points = (price - floorPrice) * POINTS_PER_BID;
  return points;
}

// Function to reset points every 24 hours
setInterval(async () => {
  // Reset points for all users
  await resetUserPoints();



  // Reset active listings and bids
  activeListings = {};
  activeBids = {};
}, POINTS_RESET_INTERVAL);

async function updatePoints(user, action, nftId, price) {
  // Get the floor price of the NFT
  const floorPrice = await getFloorPrice(nftId);
    // Calculate the acceptable price range
  const minPrice = floorPrice * 0.8;
  const maxPrice = floorPrice * 1.2;
  // Check if the user's price is within the acceptable range
  if (price >= minPrice && price <= maxPrice) {
    // Calculate the points to award
    let points;
    if (action === 'listing') {
      points = calculateListingPoints(price, floorPrice);
    } else if (action === 'bidding') {
      points = calculateBiddingPoints(price, floorPrice);
  }
  // Function to calculate the points for a listing
  function calculateListingPoints(price, floorPrice) {
    const points = (price - floorPrice) * POINTS_PER_LISTING;
    return points;
  }
  // Function to calculate the points for a bidding
  function calculateBiddingPoints(price, floorPrice) {
    const points = (price - floorPrice) * POINTS_PER_BID;
    return points;
  }
  // Function to reset points every 24 hours
  setInterval(async () => {
    // Reset points for all users
    await resetUserPoints();
    // Reset active listings and bids
    activeListings = {};
    activeBids = {};
  }, POINTS_RESET_INTERVAL);
