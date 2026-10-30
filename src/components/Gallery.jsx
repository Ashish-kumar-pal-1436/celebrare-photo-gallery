
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import useFetchPhotos from "../hooks/useFetchPhotos";
import favouritesReducer, {
  loadFavourites,
  STORAGE_KEY,
} from "../reducers/favouritesReducer";

// Loading spinner
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      <p className="mt-4 text-sm text-gray-500">Loading photos...</p>
    </div>
  );
}

// Individual photo card
function PhotoCard({ photo, isFavourite, onToggleFavourite }) {
  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={`https://picsum.photos/id/${photo.id}/600/420`}
          alt={`Photo by ${photo.author}`}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <button
          type="button"
          onClick={() => onToggleFavourite(photo)}
          aria-label={
            isFavourite
              ? `Remove photo by ${photo.author} from favourites`
              : `Add photo by ${photo.author} to favourites`
          }
          aria-pressed={isFavourite}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            fill={isFavourite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={`h-6 w-6 ${
              isFavourite ? "text-red-500" : "text-gray-600"
            }`}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <p className="text-sm font-medium text-gray-800">
          Photo by {photo.author}
        </p>
      </div>
    </article>
  );
}

function Gallery() {
  // Fetch photos using our custom hook
  const { photos, loading, error } = useFetchPhotos();

  // Manage favourites using useReducer
  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    loadFavourites
  );

  // Search input state
  const [searchTerm, setSearchTerm] = useState("");

  // Save favourites whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch (error) {
      console.error("Unable to save favourites:", error);
    }
  }, [favourites]);

  // Search handler
  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Toggle favourite action
  const handleToggleFavourite = (photo) => {
    dispatch({
      type: "TOGGLE_FAVOURITE",
      payload: photo,
    });
  };

  // Calculate filtered photos only when dependencies change
  const filteredPhotos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(normalizedSearch)
    );
  }, [photos, searchTerm]);

  // Create a Set for quick favourite lookup
  const favouriteIds = useMemo(
    () => new Set(favourites.map((photo) => photo.id)),
    [favourites]
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Photo Gallery
          </h1>

          <p className="mt-2 text-gray-500">
            Explore beautiful photos and save your favourites.
          </p>
        </header>

        {/* Search */}
        <div className="mb-8">
          <label
            htmlFor="photo-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search by author
          </label>

          <input
            id="photo-search"
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Enter an author's name..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:max-w-md"
          />
        </div>

        {/* Photo count */}
        {!loading && !error && (
          <p className="mb-5 text-sm text-gray-500">
            Showing {filteredPhotos.length} of {photos.length} photos
          </p>
        )}

        {/* Loading state */}
        {loading && <LoadingSpinner />}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
          >
            <p className="font-semibold">Unable to load photos</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Photo grid */}
        {!loading && !error && (
          <>
            {filteredPhotos.length > 0 ? (
              <section
                aria-label="Photo gallery"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {filteredPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    isFavourite={favouriteIds.has(photo.id)}
                    onToggleFavourite={handleToggleFavourite}
                  />
                ))}
              </section>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                <p className="text-lg font-semibold text-gray-800">
                  No photos found
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Try searching with a different author name.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Gallery;
