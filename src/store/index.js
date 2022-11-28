import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import swal from "sweetalert2";

import { ProviderRpcClient } from "everscale-inpage-provider";
Vue.use(Vuex);
const ever = new ProviderRpcClient();

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    userAddress: null,
    isLoading: false,
    level: 5,
    time: 120000,
    canPlay: true,
  },
  plugins: [createPersistedState()],
  modules: {},
  mutations: {
    level(state, level) {
      // mutate state
      state.level = level;
    },
    canPlay(state, status) {
      // mutate state
      state.canPlay = status;
    },
    time(state, time) {
      // mutate state
      state.time = time;
    },
    userAddress(state, address) {
      // mutate state
      console.log("herere: ", address);
      state.userAddress = address;
    },
  },
  actions: {
    success(_context, message) {
      swal.fire("Success", message, "success");
    },
    error(_context, message) {
      swal.fire("Error!", message, "error");
    },
    successWithFooter(_context, message) {
      swal.fire({
        icon: "success",
        title: "Success",
        text: message,
        footer: ``,
      });
    },
    errorWithFooterMetamask(_context, message) {
      swal.fire({
        icon: "error",
        title: "Error!",
        text: message,
        footer: `<a href= https://broxus.com/> Download EVER Wallet</a>`,
      });
    },
    async uploadPopUp(_context, message) {
      if (store.state.time <= 0) {
        store.state.level = 5;
        store.state.time = 120000;
        swal
          .fire({
            title: `Would you like to retry?`,
            text: "Come on you can do this!!",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Try again!",
          })
          .then(async (_result) => {
            window.location.reload(true);
          });
      } else {
        swal
          .fire({
            title: `Upload Moves: ${message.score} and Level: ${message.level}`,
            text: "It will cost gas",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Upload!",
          })
          .then(async (result) => {
            store.commit("level", store.state.level + 1);
            store.commit("time", store.state.time + 30000);
            store.commit("canPlay", true);
            if (result.isConfirmed) {
              await store.dispatch("uploadScore", message);
            } else {
              location.reload()
            }
          });
      }
    },
    async uploadScore(_context, message) {
      try {
        store.state.isLoading = true;
        const TonOfMazesScore = new ever.Contract(
          require("../contracts/TonOfMazeScore").TonOfMazesScore,
          process.env.VUE_APP_TON_OF_MAZES_DEPLOYMENT_ADDRESS
        );
        const output = await TonOfMazesScore.methods
          .upload({
            score: message.score,
            level: message.level,
          })
          .send({
            from: store.state.userAddress.address,
            amount: "10000000000",
            bounce: true,
          });
        console.log(output);
        store.state.isLoading = false;
        location.reload()
      } catch (error) {
        store.state.isLoading = false;
        console.error(error);
        store.dispatch("error", "Something went wrong while uploading score");
      }
    },
    async authenticate() {
      if (!(await ever.hasProvider())) {
        store.dispatch(
          "errorWithFooterMetamask",
          "Please install the EVER Wallet extension"
        );
      }
      const { accountInteraction } = await ever.requestPermissions({
        permissions: ["basic", "accountInteraction"],
      });
      store.commit("userAddress", accountInteraction);
      if (accountInteraction == null) {
        store.dispatch("error", "Insufficient permissions");
      }
    },
  },
});

export default store;
