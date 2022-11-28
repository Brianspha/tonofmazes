<template>
  <div id="gradient">
    <v-row justify="center" align="center">
      <v-col>
        <v-banner color="accent" dark rounded single-line tile>
          {{
            $store.state.userAddress
              ? $store.state.userAddress.address._address.substring(0, 10)
              : zeroAddress
          }}
        </v-banner>
      </v-col>
      <v-col>
        <v-banner color="accent" dark rounded single-line tile>
          Level: {{ difficulty - 5 }}
        </v-banner>
      </v-col>
      <v-col>
        <v-banner color="accent" dark rounded single-line tile>
          Current Moves: {{ moves }}
        </v-banner>
      </v-col>
      <v-col>
        <v-banner color="accent" dark rounded single-line tile>
          <vac
            @finish="endLevel"
            :left-time="time"
            :auto-start="false"
            ref="counter"
            @start="start"
          >
            <span slot="process" slot-scope="{ timeObj }">
              {{ timeObj.ceil.s }}
            </span>
            <span slot="finish">Done!</span>
          </vac>
        </v-banner>
      </v-col>
    </v-row>
    <div id="page">
      <div id="view">
        <div id="mazeContainer">
          <canvas id="mazeCanvas" class="border" height="1100" width="1100" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import { Maze, DrawMaze, Player } from "../scripts/maze/mazeFunctions";
export default {
  data: () => ({
    mazeCanvas: null,
    context: null,
    sprite: null,
    finishSprite: null,
    maze: null,
    draw: false,
    player: null,
    cellSize: 0,
    difficulty: 5,
    completeOne: false,
    completeTwo: false,
    moves: 0,
    time: 5000,
    zeroAddress:
      "0:0000000000000000000000000000000000000000000000000000000000000000",
  }),
  unmounted() {
    window.removeEventListener("resize", this.resize);
  },

  mounted() {
    let _this = this;
    this.difficulty = this.$store.state.level;
    this.time = this.$store.state.time;
    this.zeroAddress = this.zeroAddress.substring(0, 10);
    window.addEventListener("resize", this.resize);
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (!viewHeight || !viewWidth) {
      this.$forceUpdate();
    }
    this.mazeCanvas = document.getElementById("mazeCanvas");
    this.context = mazeCanvas.getContext("2d");
    if (viewHeight < viewWidth) {
      this.context.canvas.width = viewHeight - viewHeight / 100;
      this.context.canvas.height = viewHeight - viewHeight / 100;
    } else {
      this.canvas.width = viewWidth - viewWidth / 100;
      this.context.canvas.height = viewWidth - viewWidth / 100;
    }

    //Load and edit sprites
    this.completeOne = false;
    this.completeTwo = false;
    this.sprite = new Image();
    this.sprite.src =
      "https://image.ibb.co/dr1HZy/Pf_RWr3_X_Imgur.png" +
      "?" +
      new Date().getTime();
    this.sprite.setAttribute("crossOrigin", " ");
    this.sprite.onload = function () {
      //sprite = changeBrightness(1.2, this.sprite);
      _this.completeOne = true;
      console.log(this.completeOne);
      _this.isComplete();
    };

    this.finishSprite = new Image();
    this.finishSprite.src =
      "https://image.ibb.co/b9wqnJ/i_Q7m_U25_Imgur.png" +
      "?" +
      new Date().getTime();
    this.finishSprite.setAttribute("crossOrigin", " ");
    this.finishSprite.onload = function () {
      //  this.finishSprite = changeBrightness(1.1, this.finishSprite);
      _this.completeTwo = true;
      console.log(this.completeTwo);
      _this.isComplete();
    };
    console.log("userAddress: ", this.$store.state.userAddress);
  },
  watch: {
    "$refs.counter.state": function (newValue, oldValue) {
      console.log("oldValue: ", oldValue, " newValue: ", newValue);
      if (newValue === "finished") {
        this.player.unbindKeyDown();
      }
    },
    "$store.state.userAddress": function (newValue, oldValue) {
      console.log(oldValue, newValue);
    },
    completeOne: async function (newValue) {
      if (newValue && this.completeTwo) {
        this.$store.dispatch("authenticate");
      }
    },
    completeTwo: async function (newValue) {
      if (this.completeOne && newValue) {
        this.$store.dispatch("authenticate");
      }
    },
    "$store.state.canPlay": async function (newValue) {
      if (newValue) {
        this.time = this.$store.state.time;
        router.go(0);
      }
    },
  },
  methods: {
    startCountdown() {
      console.log("this.$refs.counter: ", this.$refs.counter);
      this.$refs.counter.startCountdown(true);
    },
    start() {},
    updateMoves(moves, endLevel) {
      this.moves = moves;
      if (endLevel || this.time <= 0) {
        this.endLevel();
      }
    },
    endLevel() {
      this.player.unbindKeyDown();
      this.$store.commit("level", this.difficulty);
      this.$store.commit("time", this.time);
      this.$store.commit("canPlay", false);
      this.$refs.counter.stopCountdown();
      this.$store.dispatch("uploadPopUp", {
        score: this.moves,
        level: this.difficulty - 5,
        makeMaze: this.makeMaze,
      });
    },
    resize() {
      let viewWidth = $("#view").width();
      let viewHeight = $("#view").height();
      if (viewHeight < viewWidth) {
        this.context.canvas.width = viewHeight - viewHeight / 100;
        this.context.canvas.height = viewHeight - viewHeight / 100;
      } else {
        this.context.canvas.width = viewWidth - viewWidth / 100;
        this.context.canvas.height = viewWidth - viewWidth / 100;
      }
      this.cellSize = this.mazeCanvas.width / this.difficulty;
      if (this.player) {
        this.draw.redrawMaze(this.cellSize);
        this.player.redrawPlayer(this.cellSize);
      }
    },
    isComplete() {
      let _this = this;
      if (this.completeOne && this.completeTwo) {
        setTimeout(function () {
          _this.makeMaze();
        }, 500);
      }
    },
    makeMaze() {
      //document.getElementById("mazeCanvas").classList.add("border");
      if (this.player) {
        this.player.unbindKeyDown();
        this.player = null;
      }

      this.cellSize = this.mazeCanvas.width / this.difficulty;
      this.maze = new Maze(this.difficulty, this.difficulty);
      this.draw = new DrawMaze(
        this.maze,
        this.context,
        this.cellSize,
        this.finishSprite
      );
      this.player = new Player(
        this.maze,
        this.mazeCanvas,
        this.cellSize,
        this.updateMoves,
        this.sprite
      );
      if (document.getElementById("mazeContainer").style.opacity < "100") {
        document.getElementById("mazeContainer").style.opacity = "100";
      }
      this.startCountdown();
    },
  },
};
</script>

<style scoped>
html,
body {
  width: 100vw;
  height: 100vh;
  position: fixed;
  padding: 0;
  margin: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#mazeContainer {
  transition-property: opacity;
  transition-duration: 1s;
  transition-timing-function: linear;
  top: 75px;
  opacity: 0;
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.3);
  margin: auto;
}

#mazeContainer #mazeCanvas {
  margin: 0;
  display: block;
  border: solid 1px black;
}

input,
select {
  transition-property: background-color opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.3);
  height: 45px;
  width: 150px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  color: white;
  display: inline-block;
  font-size: 15px;
  text-align: center;
  text-decoration: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input:hover,
select:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

input:active,
select:active {
  background-color: black;
}

input:focus,
select:focus {
  outline: none;
}

.custom-select {
  display: inline-block;
}

.custom-select select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAh0lEQVQ4T93TMQrCUAzG8V9x8QziiYSuXdzFC7h4AcELOPQAdXYovZCHEATlgQV5GFTe1ozJlz/kS1IpjKqw3wQBVyy++JI0y1GTe7DCBbMAckeNIQKk/BanALBB+16LtnDELoMcsM/BESDlz2heDR3WePwKSLo5eoxz3z6NNcFD+vu3ij14Aqz/DxGbKB7CAAAAAElFTkSuQmCC");
  background-repeat: no-repeat;
  background-position: 125px center;
}

#Message-Container {
  visibility: hidden;
  color: white;
  display: block;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

#Message-Container #message {
  width: 300px;
  height: 300px;
  position: fixed;
  top: 50%;
  left: 50%;
  margin-left: -150px;
  margin-top: -150px;
}

#page {
  font-family: "Segoe UI", Arial, sans-serif;
  text-align: center;
  height: auto;
  width: auto;
  margin: auto;
}

#page #menu {
  margin: auto;
  padding: 10px;
  height: 65px;
  box-sizing: border-box;
}

#page #menu h1 {
  margin: 0;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 3.2rem;
}

#page #view {
  position: absolute;
  top: 65px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
}

.border {
  border: 1px black solid;
  border-radius: 5px;
}

#gradient {
  z-index: -1;
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  color: #fff;
  background: linear-gradient(-45deg, #bdc3c7, #2c3e50);
  background-size: 400% 400%;
  -webkit-animation: Gradient 15s ease infinite;
  animation: Gradient 15s ease infinite;
}

@-webkit-keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 400px) {
  input,
  select {
    width: 120px;
  }
}
</style>
