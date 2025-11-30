const btn = document.getElementById("startBtn");
const scene = document.querySelector("a-scene");

btn.addEventListener("click", async () => {
  // Wait until the A-Frame scene is loaded
  if (!scene.hasLoaded) {
    await new Promise((resolve) => scene.addEventListener("loaded", resolve));
  }

  try {
    const videoSettings = {
      audio: false,
      video: {
        facingMode: { ideal: "environment" }, // rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        zoom: 1.0
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoSettings);

    // Now the AR.js system exists
    const arToolkitSource = scene.systems["arjs"].arToolkitSource;
    const video = arToolkitSource.domElement;

    video.srcObject = stream;

    btn.style.display = "none";
    console.log("Camera started successfully.");
  } catch (err) {
    console.error("Camera error:", err);
    alert("Could not start camera: " + err.message);
  }
});
