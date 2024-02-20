import SongDetails from "../components/songDetails/SongDetails";
import Lyrics from "../components/Lyrics/Lyrics";
import Header from "../components/Header/Header";
import { useLocation } from "react-router-dom";
import Youtube from "../components/Youtube/Youtube";
import Songcover from "../components/SongCover/Songcover";

import UploadCoverModal from "../components/UploadButton/UploadCoverModal";

function SongPage() {
  const songData = useLocation().state;
  console.log(songData);
  return (
    <>
      <Header />
      <SongDetails
        img={songData.coverArt}
        artist={songData.artist.name.english}
        songName={songData.name.english}
        originalLang={songData.originalLang}
      />
      <Lyrics
        originalLang={songData.originalLang}
        lyrics={songData.lyrics}
        name={songData.name}
      />

      <Youtube
        songName={songData.name.hebrew}
        artistName={songData.artist.name.hebrew}
        youtubeUrl={songData.youtubeURL}
      />

      <UploadCoverModal />

      <Songcover img={songData.coverArt} />
    </>
  );
}

export default SongPage;
