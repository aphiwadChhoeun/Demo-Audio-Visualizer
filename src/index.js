import "./styles.scss";
import AudioPlayer from "./AudioPlayer";
import { gsap } from "gsap";

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

let audioPlayer = new AudioPlayer(
  document.querySelector("#app"),
  "./slump.mp3"
);

// full circle divide by number of bar - 1 (the first bar is used to be base in the middle)
let interval = 360 / 11;

audioPlayer.onCreateDom(() => {
  let items = [];
  for (let i = 0; i < 12; i++) {
    let angle = (i - 1) * interval;

    let cc = document.createElement("div");
    cc.classList.add("circle__container");

    cc.style.transform = `rotate(${angle}deg)`;

    let c = document.createElement("div");
    c.classList.add("circle");

    cc.appendChild(c);

    items.push(cc);
  }

  return items;
});

/**
 * Customized bar rendering
 * options: {
 *  index,
 *  x,
 *  y,
 *  width,
 *  height
 * }
 */
audioPlayer.onRenderBar((bar, data, options) => {
  if (options.index > 0) {
    let distance = data.map(0, 255, 0, 180);
    let scale = distance.map(0, 180, 1, 1.8);

    let inner = bar.querySelector(".circle");
    inner.style.top = `${distance}px`;
    inner.style.transform = `translate(-50%, -50%) scaleY(${scale})`;

    gsap.to(bar, {
      rotate: `+=${Math.random() * 20 - 10}`,
      duration: 0.3,
    });
  } else {
    let scale = data.map(0, 255, 1, 1.2);
    let inner = bar.querySelector(".circle");
    inner.style.width = "200px";
    inner.style.height = "200px";
    inner.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
});

audioPlayer.init();
