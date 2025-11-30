document.getElementById("startBtn").addEventListener("click", async () => {
  try {
    const videoSettings = {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        zoom: 1.0
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoSettings);

    const arToolkitSource = document.querySelector("a-scene").systems["arjs"].arToolkitSource;
    const video = arToolkitSource.domElement;

    video.srcObject = stream;

    console.log("Camera started successfully.");
  } catch (err) {
    console.error("Camera error:", err);
    alert("Could not start camera: " + err.message);
  }
});
