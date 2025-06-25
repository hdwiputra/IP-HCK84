import { useOutletContext } from "react-router";

export default function Home() {
  // Access the anime data passed from PubLayout if needed
  const { animeData } = useOutletContext();

  return (
    <>
      <h1>Home</h1>
      {/* You can use animeData here if you need it for the Home page content */}
      {animeData && (
        <div>
          <p>Total anime loaded: {animeData.length}</p>
        </div>
      )}
    </>
  );
}
