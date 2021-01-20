<template>
  <v-container fill-height>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="4">
        <div v-if="!showBitmap">
          <v-row>
            <h2>Please enter bitmap size:</h2>
            <v-text-field
              label="Bitmap size: n, m"
              outlined
              v-model="bitmapSize"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-col cols="12" class="center">
              <v-btn
                color="primary"
                @click="createBitmap(operationModes.RANDOMIZE)"
                >RANDOMIZE</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="center">
              <v-btn color="primary" @click="createBitmap(operationModes.DRAW)"
                >DRAW</v-btn
              >
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
    <Bitmap v-if="showBitmap" :n="n" :m="m" :mode="bitmapMode" @return="showBitmap = false"/>
  </v-container>
</template>

<script>
import { modes } from "../enums";
import Bitmap from './Bitmap';

export default {
  components: {
    Bitmap
  },
  data() {
    return {
      bitmapSize: "",
      operationModes: modes,
      bitmapMode: 0,
      m: 0,
      n: 0,
      showBitmap: false,
    };
  },
  methods: {
    createBitmap(mode) {
      this.showBitmap = false;
      let splittedValues = this.bitmapSize.split(",");
      let n, m;
      if (splittedValues && splittedValues.length > 1) {
        n = Number(splittedValues[0]);
        m = Number(splittedValues[1]);
      }

      if (!Number.isInteger(n) || !Number.isInteger(n)) {
        alert("enter valid data");
        return;
      }

      this.n = n;
      this.m = m;
      this.bitmapMode = mode;
      this.showBitmap = true;
    },
  },
};
</script>

<style>
/* table td {
  border-width: 1px;
  border-style: solid;
  border-color: black;
} */
.center {
  text-align: center !important;
}
</style>