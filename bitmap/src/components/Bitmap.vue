

<template>
  <v-container fluid>
    <div id="bitmapContainer">
      <canvas id="bitmapCanvas" @click="canvasClick"/>
    </div>
    <v-container class="bottom-container">
      <v-row>
        <v-col class="center">
          <v-btn v-if="!solved" large color="primary" @click="solve">SOLVE</v-btn>
          <div v-else>
            <h4>FOUND {{ islandCount }} ISLANDS!</h4>
            <v-btn large color="primary" @click="emitReturn()">RETURN</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <InProgress v-if="showInProgress"/>
  </v-container>
</template>

<script>
import { modes } from "../enums";
import InProgress from "./InProgress";

export default {
  components: {
    InProgress
  },
  props: {
    n: Number,
    m: Number,
    mode: Number,
  },
  data() {
    return {
      selectable: false,
      solved: false,
      bitmap: [],
      islandCount: 0,
      showInProgress: false,

      canvasWidth: 0,
      canvasHeight: 0,
      canvasClientWidth: 0,
      canvasClientHeight: 0,
      context: null,
      cellHeight: 5,
      cellWidth: 5,

      neighborIndex: [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ],
    };
  },
  computed: {},
  mounted() {
    this.showInProgress = true;
    this.initBitmap();
    switch (this.mode) {
      case modes.RANDOMIZE:
        this.randomizeBitmap();
        break;
      case modes.DRAW:
        this.drawBitmap();
        break;
      default:
        break;
    }

    this.initCanvas();
    this.showInProgress = false;
  },
  created() {},
  methods: {
    initCanvas() {
      const canvas = document.getElementById("bitmapCanvas");
      const canContainer = document.getElementById("bitmapContainer");
     // this.cellWidth = canContainer.offsetWidth / this.n > this.cellWidth ? canContainer.offsetWidth / this.n : this.cellWidth;
     // this.cellHeight = canContainer.offsetHeight / this.m > this.cellHeight ? canContainer.offsetHeight / this.m : this.cellHeight;
      this.cellWidth = canContainer.scrollWidth / this.n > this.cellWidth ? canContainer.scrollWidth / this.n : this.cellWidth;
      this.cellHeight = canContainer.scrollHeight / this.m > this.cellHeight ? canContainer.scrollHeight / this.m : this.cellHeight;
      canvas.width = this.cellWidth * this.n;
      canvas.height = this.cellHeight * this.m;
      
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
      this.canvasClientWidth = canvas.clientWidth;
      this.canvasClientHeight = canvas.clientHeight;
      this.context = canvas.getContext("2d");
      this.context.strokeStyle = "black";
      this.draw(true);
    },

    fillCell(x, y) {
      this.context.fillRect(
        1 + this.cellWidth * x,
        1 + this.cellHeight * y,
        // the -1 in width and height is room for seperation between cells
        this.cellWidth - 1, 
        this.cellHeight - 1
      );
    },

    canvasClick(e) {
      if (this.mode == modes.DRAW && !this.solved) {
        const canvasRelativeX =
          (e.offsetX * this.canvasWidth) / this.canvasClientWidth;
        const canvasRelativeY =
          (e.offsetY * this.canvasHeight) / this.canvasClientHeight;
        this.context.fillStyle = "black";

        let x = Math.floor(canvasRelativeX / this.cellWidth);
        let y = Math.floor(canvasRelativeY / this.cellHeight);
        //alert(`${x}, ${y}`);
        if (
          x >= 0 &&
          x < this.n &&
          y >= 0 &&
          y < this.m &&
          this.bitmap[y][x] == 0
        ) {
          this.fillCell(x, y);
          let row = this.bitmap[y];
          row[x] = 1;
          this.bitmap.splice(y, 1, row);
        }
      }
    },

    draw(init) {
      for (let x = 0; x < this.m; x++) {
        for (let y = 0; y < this.n; y++) {
          if (init) {
            this.context.strokeRect(
              this.cellWidth * y,
              this.cellHeight * x,
              this.cellWidth,
              this.cellHeight
            );
          }
          if (this.bitmap[x][y] >= 1) {
            this.context.fillStyle = this.colorString(this.bitmap[x][y]);
            this.fillCell(y, x);
          }
        }
      }
    },

    initBitmap() {
      this.solved = false;
      for (let i = 0; i < this.m; i++) {
        this.bitmap.push([]);
        for (let j = 0; j < this.n; j++) {
          this.bitmap[i].push(0);
        }
      }
    },

    randomNum(range) {
      return Math.floor(Math.random() * range); // from 0 to range - 1
    },

    randomizeBitmap() {
      let randomIterations = this.randomNum(this.n * this.m) + 1; // randomNum starts from 0
      for (let i = 0; i < randomIterations; i++) {
        let randomRow = this.randomNum(this.m);
        let randomCol = this.randomNum(this.n);
        while (this.bitmap[randomRow][randomCol] == 1) {
          randomRow = this.randomNum(this.m);
          randomCol = this.randomNum(this.n);
        }
        this.bitmap[randomRow][randomCol] = 1;
      }

      // if (this.m == 1000 && this.n == 1000) {
      //   for (let i = 0; i < this.m; i++) {
      //     for (let j = 0; j < this.n; j++) {
      //       this.bitmap[i][j] = 1;
      //     }
      //   }
      // }
    },

    drawBitmap() {
      this.selectable = true;
    },

    colorString(islandId) {
      return `${islandId > 1 ? `hsl(${(islandId * 130)% 360 + 1},90%,30%)` : "black"}`;
    },

    scanNeighbors(row, col, islandId) {
      if (this.bitmap[row][col] > 1) return;
      this.bitmap[row][col] = islandId;
      for (let i = 0; i < this.neighborIndex.length; i++) {
        let destRow = row + this.neighborIndex[i][0];
        let destCol = col + this.neighborIndex[i][1];
        if (
          destRow >= 0 &&
          destRow < this.m &&
          destCol >= 0 &&
          destCol < this.n &&
          this.bitmap[destRow][destCol] === 1
        ) {
          return this.scanNeighbors(destRow, destCol, islandId);
        }
      }
    },

    solve() {
      try {
        this.showInProgress = true;
        this.islandCount = 0;
        this.solved = false;
        let neighborQueue = [];
        for (let i = 0; i < this.m; i++) {
          for (let j = 0; j < this.n; j++) {
            if (this.bitmap[i][j] == 1) {
              this.islandCount++;
              //this.scanNeighbors(i, j, this.islandCount + 1); // for recursive solution
              let currentIslandId = this.islandCount + 1;
              this.bitmap[i][j] = currentIslandId;
              
              // Queue solution
              neighborQueue = [];
              neighborQueue.push(i * this.n + j);
              while (neighborQueue.length > 0) {
                let id = neighborQueue.pop();
                let row = Math.floor(id / this.n);
                let col = id % this.n;

                // Checking each neighbor
                this.neighborIndex.forEach((neighborIdx) => {
                  let destRow = row + neighborIdx[0];
                  let destCol = col + neighborIdx[1];
                  if (
                    destRow >= 0 &&
                    destRow < this.m &&
                    destCol >= 0 &&
                    destCol < this.n &&
                    this.bitmap[destRow][destCol] === 1
                  ) {
                    this.bitmap[destRow][destCol] = currentIslandId;
                    neighborQueue.push(destRow * this.n + destCol);
                  }
                });
              }
            }
          }
        }

        this.draw(true);
      } catch (ex) {
        alert(ex);
      } finally {
        // So we can return
        this.solved = true;
        this.showInProgress = false;
      }
    },

    emitReturn() {
      this.$emit("return");
    },
  },
};
</script>

<style scoped>
canvas {
  display: block;
  margin:  0 auto;
  margin-right: auto;
  margin-left: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.bottom-container {
  /* position: absolute; */
  bottom: 0px;
}
#bitmapContainer{
    height: 500px; 
    width: 100%; 
    overflow: scroll;
}
</style>