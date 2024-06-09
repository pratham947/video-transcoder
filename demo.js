import { useState } from "react";
import ReactPlayer from "react-player/lazy";
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  const signedUrl =
    "https://output-decoded.s3.ap-south-1.amazonaws.com/1717898663769-653288118/C%3A%5CUsers%5C91626%5CDocuments%5CHarkirat%5Cvideo-transcoder%5Cloop%5Cuploads%5C1717898663769-653288118%5Coutput_480p.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZ2VQ2RGCFC4EI6EP%2F20240609%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240609T054856Z&X-Amz-Expires=4500&X-Amz-Signature=9b568d59e16df505e6a4f9e596cb1462e9d98a8073c730aaa8a3aa2ee4e3e677&X-Amz-SignedHeaders=host&x-id=GetObject";
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("video", file);

    const url = "http://localhost:3000/upload";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          accept="video/*"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Submit</button>
      </form>

      <div className="player-wrapper">
        <ReactPlayer
          className="react-player"
          url={signedUrl}
          // pip
          controls
        />
      </div>
      <Button variant="default">Click here</Button>
    </div>
  );
}

export default App;
