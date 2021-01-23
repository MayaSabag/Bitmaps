<template>
  <v-container fluid>
    <div id="bitmapContainer">
      <canvas id="bitmapCanvas" @click="canvasClick" />
    </div>
    <v-container class="bottom-container">
      <v-row>
        <v-col class="center">
          <v-btn v-if="!solved" large color="primary" @click="solve"
            >SOLVE</v-btn
          >
          <div v-else>
            <h4>FOUND {{ islandCount }} ISLANDS!</h4>
            <v-btn large color="primary" @click="emitReturn()">RETURN</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import { modes } from "../enums";

export default {
  props: {
    n: Number,
    m: Number,
    mode: Number,
  },
  data() {
    return {
      solved: false,
      bitmap: [],
      islandCount: 0,
      
      canvasWidth: 0,
      canvasHeight: 0,
      canvasClientWidth: 0,
      canvasClientHeight: 0,
      context: null,
      cellHeight: 0,
      cellWidth: 0,
      smallWidth: 8,
      smallHeight: 8,

      neighborIndex: [[-1, -1], [-1, 0],[-1, 1],[0, -1], [0, 1], [1, -1], [1, 0], [1, 1],],
    };
  },
  computed: {},
  mounted() {
    this.initBitmap();
    switch (this.mode) {
      case modes.RANDOMIZE:
        this.randomizeBitmap();
        break;
      case modes.DRAW:
        break;
      default:
        break;
    }

    this.initCanvas();
  },
  created() {},
  methods: {
    initBitmap() {
      this.solved = false;
      for (let i = 0; i < this.m; i++) {
        this.bitmap.push([]);
        for (let j = 0; j < this.n; j++) {
          this.bitmap[i].push(0);
        }
      }
    },

    initCanvas() {
      const canvas = document.getElementById("bitmapCanvas");
      const canvasContainer = document.getElementById("bitmapContainer");

      // Fixed cell size
      this.cellWidth =  canvasContainer.scrollWidth / this.n > this.smallWidth
          ? this.smallWidth * 5
          : this.smallWidth;
      this.cellHeight = canvasContainer.scrollHeight / this.m > this.smallHeight
          ? this.smallHeight * 5
          : this.smallHeight;
      this.cellWidth = this.cellHeight = Math.min(this.cellWidth, this.cellHeight); // For a symmetrical (cube) cell
      
      // Uncomment this if should fit div (canvas container) size (makes asymmetrical cell if m != n)
      /*this.cellWidth =
        canvasContainer.scrollWidth / this.n > this.smallWidth
          ? canvasContainer.scrollWidth / this.n
          : this.smallWidth;
      this.cellHeight =
        canvasContainer.scrollHeight / this.m > this.smallHeight
          ? canvasContainer.scrollHeight / this.m
          : this.smallHeight; */
      
      this.canvasWidth = canvas.width = this.cellWidth * this.n;
      this.canvasHeight = canvas.height = this.cellHeight * this.m;
      this.canvasClientWidth = canvas.clientWidth;
      this.canvasClientHeight = canvas.clientHeight;
      this.context = canvas.getContext("2d");
      this.context.strokeStyle = "black";
      this.draw(true);
    },

    fillCell(x, y, value) {
      this.context.fillStyle = this.colorString(value);
      this.context.fillRect(
        1 + this.cellWidth * x,
        1 + this.cellHeight * y,
        // The -1 on width and height is room for seperation between cells
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
          
          let row = this.bitmap[y];
          row[x] = 1;
          this.bitmap.splice(y, 1, row);
          this.fillCell(x, y, this.bitmap[y][x]); // Colors it black
        }
      }
    },

    draw(paintRect) {
      for (let i = 0; i < this.m; i++) {
        for (let j = 0; j < this.n; j++) {
          if (paintRect) {
            this.context.strokeRect(
              this.cellWidth * j,
              this.cellHeight * i,
              this.cellWidth,
              this.cellHeight
            );
          }
          if (this.bitmap[i][j] >= 1) {
            this.fillCell(j, i, this.bitmap[i][j]);
          }
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

      // Test case - big island
      // if (this.m == 1000 && this.n == 1000) {
      //   for (let i = 0; i < this.m; i++) {
      //     for (let j = 0; j < this.n; j++) {
      //       this.bitmap[i][j] = 1;
      //     }
      //   }
      // }
    },

    colorString(islandId) {
      return `${
        islandId > 1 ? `hsl(${((islandId * 135) % 360) + 1},90%,30%)` : "black"
      }`;
    },

    scanNeighbors(row, col, islandId) {
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
        this.islandCount = 0;
        this.solved = false;
        let neighborQueue = [];
        for (let i = 0; i < this.m; i++) {
          for (let j = 0; j < this.n; j++) {
            if (this.bitmap[i][j] == 1) {
              this.islandCount++;
              //this.scanNeighbors(i, j, this.islandCount + 1); // For recursive solution
              let currentIslandId = this.islandCount + 1; // Starting Ids from 2, 1 is black\unprocessed
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

        this.draw(true); // I passed true so all cells are repainted, to see the borders. Passing false here is possible too, it just 
        // covers the inner cell borders inside the islands with its color
      } catch (ex) {
        alert(ex);
      } finally {
        // So we can return
        this.solved = true;
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
  margin: 0 auto;
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
#bitmapContainer {
  height: 500px;
  width: 100%;
  overflow: scroll;
}
</style>