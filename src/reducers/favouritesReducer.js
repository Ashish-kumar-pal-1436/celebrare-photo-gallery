
const STORAGE_KEY = "celebrare-favourites";

// Load saved favourites when the app starts
export function loadFavourites() {
  try {
    const savedFavourites = localStorage.getItem(STORAGE_KEY);

    return savedFavourites ? JSON.parse(savedFavourites) : [];
  } catch (error) {
    console.error("Unable to load favourites:", error);
    return [];
  }
}

// Handle favourite actions
function favouritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE": {
      const photoExists = state.some(
        (photo) => photo.id === action.payload.id
      );

      if (photoExists) {
        return state.filter(
          (photo) => photo.id !== action.payload.id
        );
      }

      return [...state, action.payload];
    }

    default:
      return state;
  }
}

export { STORAGE_KEY };
export default favouritesReducer;
