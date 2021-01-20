

<template>
  <v-container>
    <v-row>
      <v-subheader v-if="bitmap && bitmap.length > 0">
        Presenting rows: {{ fromRow + 1 }} -
        {{ Math.min(toRow, n) }} of {{ n }},
        columns: {{ fromCol + 1 }} -
        {{ Math.min(toCol, m) }} of
        {{ m }}</v-subheader
      >
    </v-row>
    <v-container
      id="scroll-target"
      class="overflow-y-auto overflow-x-auto"
      ref="bitmapContainer"
      style="height: 500px"
    >
      <div v-scroll:#scroll-target="onScroll">
        <table>
          <tbody>
            <tr v-for="(row, rowindex) in visibleBitmap" :key="rowindex">
              <td
                v-for="(col, colindex) in row"
                :key="rowindex - colindex"
                readonly
                disabled
                @click="markBit(rowindex, colindex)"
                color="primary"
                :style="colorString(visibleBitmap[rowindex][colindex])"
                ref="tdItem"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-container>
    <v-row v-if="!solved" justify-center align-center>
      <v-col cols="12" class="center">
        <v-btn
          color="primary"
          @click="solve">SOLVE</v-btn
        >
      </v-col>
    </v-row>

    <v-row v-else justify-center align-center>
      <v-col cols="12" class="center">
        <h4>FOUND {{ islandCount }} ISLANDS!</h4>
        <v-btn color="primary" @click="emitReturn()">RETURN</v-btn>
      </v-col>
    </v-row>
    <InProgress v-if="showInProgress" />
  </v-container>
</template>

<script>
import { modes } from "../enums";
import InProgress from "./InProgress";
// import { calcNoOfIslands } from "../islands.js";

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

      // Scrolling data
      cellHeight: 0,
      cellWidth: 0,
      containerHeight: 500,
      containerWidth: 1137,
      cellsInHeight: 10,
      cellsInWidth: 22,
      fromRow: 0,
      fromCol: 0,
      toRow: 0,
      toCol: 0,
    };
  },
  computed: {
    visibleBitmap() {
      let filtered = [];
      this.bitmap.forEach((row, rowIndex) => {
        if (rowIndex >= this.fromRow && rowIndex <= this.toRow) {
          filtered.push(
            row.filter((value, colIndex) => {
              return colIndex >= this.fromCol && colIndex <= this.toCol;
            })
          );
        }
      });

      return filtered;
    },
  },
  updated() {
      console.log('updated');
      this.showInProgress = false;
  },
  mounted() {
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
  },
  created() {
    this.$nextTick(() => {
      if (
        this.$refs.tdItem[0] &&
        this.$refs.tdItem[0].clientHeight &&
        this.$refs.tdItem[0].clientWidth
      ) {
        this.cellHeight = this.$refs.tdItem[0].clientHeight;
        this.cellWidth = this.$refs.tdItem[0].clientWidth;

        this.containerHeight = this.$refs.bitmapContainer.clientHeight;
        this.containerWidth = this.$refs.bitmapContainer.clientWidth;
      }

      this.cellsInHeight = Math.ceil(this.containerHeight / this.cellHeight);
      this.cellsInWidth = Math.ceil(this.containerWidth / this.cellWidth);

      this.toRow = this.cellsInHeight;
      this.toCol = this.cellsInWidth;
    });
  },
  methods: {
    initBitmap() {
      this.solved = false;
      for (let i = 0; i < this.n; i++) {
        this.bitmap.push([]);
        for (let j = 0; j < this.m; j++) {
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
        let randomRow = this.randomNum(this.n);
        let randomCol = this.randomNum(this.m);
        while (this.bitmap[randomRow][randomCol] == 1) {
          randomRow = this.randomNum(this.n);
          randomCol = this.randomNum(this.m);
        }
        this.bitmap[randomRow][randomCol] = 1;
      }
    },

    drawBitmap() {
      this.selectable = true;
    },

    colorString(islandId) {
      if (islandId == 0) return "";
      return `background-color: ${
        islandId > 1 ? `hsl(${islandId * 150},50%,75%)` : "black"
      }`;
    },

    onScroll(e) {
      this.showInProgress = true;
      let scrollHeight = e.target.scrollHeight - e.target.clientHeight;
      let scrollWidth = e.target.scrollWidth - e.target.clientWidth;
      let percentHieght =
        e.target.scrollTop / (scrollHeight == 0 ? 1 : scrollHeight);
      let percentWidth =
        e.target.scrollLeft / (scrollWidth == 0 ? 1 : scrollWidth);

      this.fromRow = Math.ceil(this.n * percentHieght);
      this.fromCol = Math.ceil(this.m * percentWidth);

      this.toRow = this.fromRow + this.cellsInHeight;
      this.toCol = this.fromCol + this.cellsInWidth;
      console.log(`${this.toRow} ${this.toCol}`);
    },

    markBit(n, m) {
      if (this.mode == modes.DRAW && !this.solved) {
        let row = this.bitmap[n + this.fromRow];
        row[m + this.fromCol] = 1;
        this.bitmap.splice(n + this.fromRow, 1, row);
      }
    },

    scanNeighbors(bitmap, row, col, islandId) {
      if (
        row >= 0 &&
        row < this.n &&
        col >= 0 &&
        col < this.m &&
        bitmap[row][col] == 1
      ) {
        bitmap[row][col] = islandId;

        // Up
        this.scanNeighbors(bitmap, row - 1, col - 1, islandId);
        this.scanNeighbors(bitmap, row - 1, col, islandId);
        this.scanNeighbors(bitmap, row - 1, col + 1, islandId);

        // Sides
        this.scanNeighbors(bitmap, row, col - 1, islandId);
        this.scanNeighbors(bitmap, row, col + 1, islandId);

        // Down
        this.scanNeighbors(bitmap, row + 1, col - 1, islandId);
        this.scanNeighbors(bitmap, row + 1, col, islandId);
        this.scanNeighbors(bitmap, row + 1, col + 1, islandId);
      }
    },

    solve() {
      try {
        let bitmap = [...this.bitmap];
        // let res = calcNoOfIslands(bitmap);
        // if (res) {
        //     this.islandCount = res.islandCount;
        // }
        this.islandCount = 0;
        for (let i = 0; i < this.n; i++) {
          for (let j = 0; j < this.m; j++) {
            if (bitmap[i][j] == 1) {
              this.islandCount++;
              this.scanNeighbors(bitmap, i, j, this.islandCount + 1);
            }
          }
        }

        // Since vue arrays are not reactive, "updating" the visible part for the sake of reactivity
        for (let row = this.fromRow; row < Math.min(this.toRow, this.n); row++) {
          this.bitmap.splice(row, 1, bitmap[row]);
        }
      } catch(ex){
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
table td {
  border-width: 1px;
  border-style: solid;
  border-color: black;
  /* width: 50px;
  height: 50px; */
  padding: 10px;
}
.v-col {
  text-align: center;
}
</style>