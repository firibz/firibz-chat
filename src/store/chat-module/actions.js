import { firebaseDb } from "boot/firebase";
import { ref, onChildAdded, off, push, get } from "firebase/database";

let messagesRef;

export function firebaseGetMessages(
  { commit, dispatch, rootState },
  otherUserId
) {
  let userId =
    rootState.user.userDetails.userId ||
    JSON.parse(localStorage.getItem("user"));
  messagesRef = ref(firebaseDb, "chats/" + userId + "/" + otherUserId);
  commit("SHOW_LOADING", true);
  get(messagesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        commit("ADD_ALL_MESSAGES", snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      dispatch("alert/error", error.message, { root: true });
      console.error(error);
    })
    .finally(() => {
      commit("SHOW_LOADING", false);
    });
  onChildAdded(messagesRef, (snapshot) => {
    let messageDetails = snapshot.val();
    let messageId = snapshot.key;
    commit("ADD_MESSAGE", {
      messageId,
      messageDetails,
    });
  });
}

export function firebaseStopGettingMessages({ commit }) {
  if (messagesRef) {
    off(messagesRef, "child_added");
    commit("CLEAR_MESSAGES");
  }
}

export function firebaseSendMessage({ rootState }, payload) {
  let userId = rootState.user.userDetails.userId;
  // ref(
  //   firebaseDb,
  //   "chats/" + state.userDetails.userId + "/" + payload.otherUserId
  // ).push(payload.message);
  push(
    ref(firebaseDb, "chats/" + userId + "/" + payload.otherUserId),
    payload.message
  );
  // ref(
  //   firebaseDb,
  //   "chats/" + payload.otherUserId + "/" + state.userDetails.userId
  // ).push(payload.message);
  payload.message.from = "them";
  push(
    ref(firebaseDb, "chats/" + payload.otherUserId + "/" + userId),
    payload.message
  );
}
