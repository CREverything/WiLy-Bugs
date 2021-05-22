import firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyBwzuW_Mh7tdU0SIQKwumQJAegCPZG0IsY",
  authDomain: "wily-805c7.firebaseapp.com",
  projectId: "wily-805c7",
  storageBucket: "wily-805c7.appspot.com",
  messagingSenderId: "329808579632",
  appId: "1:329808579632:web:eacafe5a836299d3aa71f5",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
