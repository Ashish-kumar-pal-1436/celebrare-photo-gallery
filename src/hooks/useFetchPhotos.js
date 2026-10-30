
import { useEffect, useState } from "react";

const PHOTOS_URL = "https://picsum.photos/v2/list?limit=30";

function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(PHOTOS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch photos. Please try again.");
        }

        const data = await response.json();
        setPhotos(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPhotos();

    return () => controller.abort();
  }, []);

  return { photos, loading, error };
}

export default useFetchPhotos;
