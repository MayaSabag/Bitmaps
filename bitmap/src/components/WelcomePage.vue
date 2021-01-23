<template>
  <v-container fill-height class="page-container">
    <v-form ref="form" lazy-validation>
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8">
          <div v-if="!showBitmap">
            <v-row>
              <h1>Please enter bitmap size:</h1>
              <v-text-field
                label="Bitmap size: n, m"
                outlined
                v-model="bitmapSize"
                :rules="inputRules"
                validate-on-blur
              ></v-text-field>
            </v-row>
            <v-row>
              <v-col class="center">
                <v-btn
                  large
                  color="primary"
                  @click="createBitmap(operationModes.RANDOMIZE)"
                  >RANDOMIZE</v-btn
                >
              </v-col>
            </v-row>
            <v-row>
              <v-col class="center">
                <v-btn
                  large
                  color="primary"
                  @click="createBitmap(operationModes.DRAW)"
                  >DRAW</v-btn
                >
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-form>
    <Bitmap
      v-if="showBitmap"
      :n="n"
      :m="m"
      :mode="bitmapMode"
      @return="showBitmap = false"
    />
  </v-container>
</template>

<script>
import { modes } from "../enums";
import Bitmap from "./Bitmap";

export default {
  components: {
    Bitmap,
  },
  data() {
    return {
      bitmapSize: "",
      operationModes: modes,
      bitmapMode: 0,
      m: 0,
      n: 0,
      showBitmap: false,
      inputRules: [
        (v) => !!v || "Enter n, m",
        (v) => /^\d+\s*,\s*\d+$/.test(v) || "Please enter values in the required format",
      ],
    };
  },
  methods: {
    createBitmap(mode) {
      if (this.$refs.form.validate()) {
        let splittedValues = this.bitmapSize.split(",");
        let n, m;
        if (splittedValues && splittedValues.length > 1) {
          n = Number(splittedValues[0]);
          m = Number(splittedValues[1]);
        }

        this.n = n;
        this.m = m;
        this.bitmapMode = mode;
        this.showBitmap = true;
      }
    },
  },
};
</script>

<style>
.center {
  text-align: center;
}
.page-container {
  display: flex;
  justify-content: center;
}
</style>