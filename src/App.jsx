import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

const API = "https://picsum.photos/v2/list";

// download_url looks like https://picsum.photos/id/10/2500/1667
// Ask the same URL for a small version so the list loads fast.
const thumbUrl = (url, w = 220, h = 150) => url.replace(/\/\d+\/\d+$/, `/${w}/${h}`);

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [likes, setLikes] = useState({}); // { [photoId]: count }
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const sentinelRef = useRef(null);
  const busyRef = useRef(false); // blocks duplicate requests while one is running

  const loadPage = useCallback(async () => {
    if (busyRef.current || !hasMore) return;
    busyRef.current = true;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}?page=${page}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false); // empty page = no more data
      } else {
        setPhotos((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...data.filter((p) => !seen.has(p.id))];
        });
        setPage((p) => p + 1);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, [page, hasMore]);

  // Watch the sentinel at the bottom. Re-created after each load, so if the
  // screen is still not full, the next page is fetched automatically.
  useEffect(() => {
    if (!hasMore || error) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadPage();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadPage, hasMore, error, loading]);

  const like = (id) => setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  return (
    <div className="app">
      <h1>Photo gallery</h1>

      <ul className="list">
        {photos.map((p) => (
          <li className="item" key={p.id}>
            <img
              src={thumbUrl(p.download_url)}
              alt={`Photo by ${p.author}`}
              width="110"
              height="75"
              loading="lazy"
            />
            <span className="author">Author: {p.author}</span>
            <button
              className="like"
              onClick={() => like(p.id)}
              aria-label={`Like photo by ${p.author}`}
            >
              <FontAwesomeIcon icon={faThumbsUp} />
            </button>
            <span className="count" data-testid={`count-${p.id}`}>
              {likes[p.id] || 0}
            </span>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="status">
        {loading && <p>Loading…</p>}
        {error && (
          <p className="error">
            {error}. <button onClick={loadPage}>Try again</button>
          </p>
        )}
        {!hasMore && <p>You have reached the end.</p>}
      </div>
    </div>
  );
}
