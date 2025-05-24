import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "./components/GoogleLoginButton";
import { useState, useEffect } from "react";
import axios from "axios";

const POLLING_INTERVAL = 3000; // every 3 seconds

const App = () => {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleGenerateDesign = async () => {
    if (!selectedImage) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("shape", "round");
    formData.append("design", "sleek and beautiful");
    formData.append("length", "long");
    formData.append("image", selectedImage);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8003/nails/generate_nail_design/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setTaskId(response.data.task_id);
      setStatus("PENDING");
      setResult(null);
      setError(null);
    } catch (err) {
      console.error("Error generating design:", err);
      setError("Failed to start task.");
    }
  };

  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(() => {
      axios
        .get(`http://127.0.0.1:8003/nails/check_task_status/${taskId}/`)
        .then((res) => {
          const data = res.data;
          setStatus(data.status);
          if (data.status === "SUCCESS") {
            console.log("my_designs", data.result);

            // getting only the first design
            setResult(data.result.generated_designs[0]);
            clearInterval(interval);
          } else if (data.status === "FAILURE") {
            setError(data.error);
            clearInterval(interval);
          }
        })
        .catch((err) => {
          console.error("Error checking task status:", err);
          setError("Failed to connect.");
          clearInterval(interval);
        });
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [taskId]);

  return (
    <>
      <h1>Nail Design Generator</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])}
      />

      <button onClick={handleGenerateDesign}>Generate Design</button>

      {status === "PENDING" && <p>Generating design... Please wait.</p>}
      {status === "FAILURE" && <p>Error: {error}</p>}
      {status === "SUCCESS" && (
        <div>
          <p>Design generated successfully!</p>
          {/* Displaying only the first design */}
          <img
            src={`http://127.0.0.1:8003/img/${result}`}
            alt="Generated design"
            width={300}
          />
        </div>
      )}

      {/* Ignore */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLoginButton />
      </GoogleOAuthProvider>
    </>
  );
};

export default App;
