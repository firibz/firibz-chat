import { firebaseDb } from "boot/firebase";
import { ref, onChildAdded, off, push } from "firebase/database";

let messagesRef;

export function firebaseGetMessages({ commit, rootState }, otherUserId) {
  let userId =
    rootState.user.userDetails.userId ||
    JSON.parse(localStorage.getItem("user"));
  messagesRef = ref(firebaseDb, "chats/" + userId + "/" + otherUserId);
  // commit("showLoading", true);
  onChildAdded(messagesRef, (snapshot) => {
    let messageDetails = snapshot.val();
    let messageId = snapshot.key;
    commit("addMessage", {
      messageId,
      messageDetails,
    });
    // commit("showLoading", false);
  });
}

export function firebaseStopGettingMessages({ commit }) {
  if (messagesRef) {
    off(messagesRef, "child_added");
    commit("clearMessages");
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
