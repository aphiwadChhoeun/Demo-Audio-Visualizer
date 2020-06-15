import { gsap } from "gsap";

export default class AudioPlayer {
  constructor(container, audioPath, options = { numberOfBars: 20 }) {
    this.container = container;
    this.visualContainer = this.container.querySelector("#visual");
    this.audioPath = audioPath;
    this.btnPlay = this.container.querySelector("#btn__play");
    this.playingState = 0;

    this.audio = document.createElement("audio");
    this.audio.src = this.audioPath;

    this.numberOfBars = options.numberOfBars;

    this.initDomCallback = null;
    this.renderBarCallback = null;

    // adjust bar size if needed
    window.addEventListener("resize", this.onResize.bind(this));
  }

  get viewport() {
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;
    let aspectRatio = width / height;
    return {
      width,
      height,
      aspectRatio,
    };
  }

  init() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    let source = this.audioCtx.createMediaElementSource(this.audio);
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.audio.addEventListener("ended", () => {
      this.audio.currentTime = 0;
    });

    this.initDom();
    this.createEventListeners();
  }

  setBars(numberOfBars) {
    this.numberOfBars = numberOfBars;
  }

  initDom() {
    this.bars = [];
    this.visualContainer.innerHTML = "";

    if (this.initDomCallback !== null) {
      this.bars = this.initDomCallback();
      if (this.bars) {
        this.numberOfBars = this.bars.length;

        for (let i = 0; i < this.bars.length; i++) {
          this.visualContainer.appendChild(this.bars[i]);
        }
      }
    } else {
      for (let i = 0; i < this.numberOfBars; i++) {
        let t = document.createElement("div");
        t.classList.add("bar");
        this.bars.push(t);
        this.visualContainer.appendChild(t);
      }
    }

    if (this.dataArray.length > 0 && this.bars) {
      this.drawBars();
    }
  }

  onCreateDom(callback) {
    this.initDomCallback = callback;
  }

  drawBars() {
    if (this.bars && this.bars.length > 0) {
      // take only 70% of raw data to work with cuz the rest are silent
      let filterAmount = Math.ceil(this.dataArray.length * 0.7);

      // selective data to analyse
      let interval = Math.floor(filterAmount / this.bars.length);

      let y = this.viewport.height / 2;
      let width = this.viewport.width / this.bars.length;

      for (let i = 0; i < this.bars.length; i++) {
        if (this.renderBarCallback !== null) {
          this.renderBarCallback(this.bars[i], this.dataArray[i * interval], {
            index: i,
            x: i * width,
            y: y,
            width: width,
            height: this.dataArray[i * interval],
          });
        } else {
          this.bars[i].style.left = `${i * width}px`;
          this.bars[i].style.top = `${y - this.dataArray[i * interval]}px`;
          this.bars[i].style.width = `${width}px`;
          this.bars[i].style.height = `${this.dataArray[i * interval]}px`;
          this.bars[i].style.background = `rgba(${
            this.dataArray[i * interval] * 0.5
          }, 0, 0, 1.0)`;
        }
      }
    }
  }

  onRenderBar(callback) {
    this.renderBarCallback = callback;
  }

  onResize() {
    this.drawBars(this.dataArray);
  }

  createEventListeners() {
    this.btnPlay.addEventListener("click", () => {
      if (this.playingState == 0) {
        this.audio.play();
        this.animate();
      } else {
        this.audio.pause();
        cancelAnimationFrame(this.ANIMATION_FRAME_ID);
      }
      this.playingState = !this.playingState;
      this.upateButtonByState(this.playingState);
    });
  }

  upateButtonByState(state) {
    const shapePlay = this.btnPlay.querySelector(".shape__play");
    const shapePause = this.btnPlay.querySelector(".shape__pause");
    let duration = 0.15;

    if (state == 1) {
      gsap.to(shapePlay, {
        rotateX: 90,
        scale: 0.2,
        duration: duration,
        ease: "power3.out",
        onComplete: () => {
          shapePlay.style.display = "none";

          gsap.to(shapePause, {
            startAt: {
              display: "block",
              scale: 0.2,
              rotateX: 90,
            },
            rotateX: 0,
            scale: 1,
            duration: duration,
            ease: "power3.out",
          });
        },
      });
    } else {
      gsap.to(shapePause, {
        rotateX: 90,
        scale: 0.2,
        duration: duration,
        ease: "power3.out",
        onComplete: () => {
          shapePause.style.display = "none";

          gsap.to(shapePlay, {
            startAt: {
              display: "block",
              scale: 0.2,
              rotateX: 90,
            },
            rotateX: 0,
            scale: 1,
            duration: duration,
            ease: "power3.out",
          });
        },
      });
    }
  }

  animate() {
    this.analyser.getByteFrequencyData(this.dataArray);
    this.drawBars();

    this.ANIMATION_FRAME_ID = requestAnimationFrame(this.animate.bind(this));
  }
}
