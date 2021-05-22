import React from "react";

import db from "../config.js";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Permissions from "expo-permissions";
import firebase from "firebase";

export default class BookTransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      scanned: false,
      scanBookId: "",
      scanStudentId: "",
      buttonState: "normal",
      transactionMessage: "",
    };
  }

  handleBarcodeScanned = async ({ type, data }) => {
    const buttonState = this.state.buttonState;

    if (buttonState == "BookId") {
      this.setState({
        scanned: true,
        scanBookId: data,
        buttonState: "normal",
      });
    }

    if (buttonState == "StudentId") {
      this.setState({
        scanned: true,
        scanStudentId: data,
        buttonState: "normal",
      });
    }
  };

  initiateBookIssue = async () => {
    db.collection("transaction").add({
      studentId: this.state.scanStudentId,
      bookId: this.state.scanBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue",
    });

    db.collection("books").doc(this.state.scanBookId).update({
      bookAvailability: false,
    });

    db.collection("students")
      .doc(this.state.scanStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });

    this.setState({
      scanBookId: "",
      scanStudentId: "",
    });
  };

  initiateBookReturn = async () => {
    db.collection("transaction").add({
      studentId: this.state.scanStudentId,
      bookId: this.state.scanBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return",
    });

    db.collection("books").doc(this.state.scanBookId).update({
      bookAvailability: true,
    });

    db.collection("students")
      .doc(this.state.scanStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });

    this.setState({
      scanBookId: "",
      scanStudentId: "",
    });
  };

  checkBookEligibility = async () => {
    var transactionType = "";
    var bookRef = await db
      .collection("books")
      .where("bookId", "==", this.state.scanBookId)
      .get();
    console.log(bookRef.docs);
    try {
      if (bookRef.docs.length == 0) {
        transactionType = false;
        console.log(bookRef.docs.length);
        /* ToastAndroid.show(
        "The book you are trying to issue does not exist.",
        Toast.LONG*/

        //);
        Alert.alert("The book you are trying to issue does not exist.");
      } else {
        bookRef.docs.map((doc) => {
          var book = doc.data();
          if (book.bookAvailability) {
            transactionType = "Issue";
          } else {
            transactionType = "Return";
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
    console.log("checkBookEligibility executed " + transactionType);
    return transactionType;
  };

  checkStudentEligibilityForBookIssue = async () => {
    console.log("checkStudentEligibilityForBookIssue executed");

    const studentRef = await db
      .collection("students")
      .where("studentId", "==", this.state.scanStudentId)
      .get();

    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      console.log(ref.docs.length);
      Alert.alert("This student ID does not exist in our database");

      isStudentEligible = false;
      this.setState({
        scanBookId: "",
        scanStudentId: "",
      });
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.numberOfBooksIssued < 2) {
          isStudentEligible = true;
          console.log("no of books issued less than 2");
        } else {
          isStudentEligible = false;

          Alert.alert("This student has already issued 2 books");

          this.setState({
            scanBookId: "",
            scanStudentId: "",
          });
        }
      });
    }
    console.log(
      "checkStudentEligibilityForBookIssue executed" + isStudentEligible
    );
    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async () => {
    var isStudentEligible = true;
    const transactionRef = await db
      .collection("transaction")
      .where("bookId", "==", this.state.scanBookId)
      .limit(1)
      .get();

    try {
      transactionRef.docs.map((doc) => {
        var lastBookTransaction = doc.data();
        if (lastBookTransaction.studentId === this.state.scanStudentId) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          // ToastAndroid.show(
          //   "This book wasn't issued by this student.",
          //   Toast.LONG
          // );
          Alert.alert("This book wasn't issued by this student.");

          this.setState({
            scanBookId: "",
            scanStudentId: "",
          });
        }
      });
    } catch (error) {
      console.log(error);
    }

    return isStudentEligible;
  };

  handleTransaction = async () => {
    var transactionMessage = "";

    var transactionType = await this.checkBookEligibility();
    console.log("Transaction Type," + transactionType);
    if (!transactionType) {
      Toast.show("This book does not exist in our library.", Toast.SHORT);
      Alert.alert("This book does not exist in our library");
      this.setState({
        scanStudentId: "",
        scanBookId: "",
      });
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        transactionMessage = "Book Issued";
        ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        Alert.alert("Book Issued");
      }
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();
        transactionMessage = "Book Returned";
        ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        Alert.alert("Book Returned");
      }
    }
  };

  render() {
    const hasCameraPermission = this.state.hasCameraPermission;
    const buttonState = this.state.buttonState;
    const scanned = this.state.scanned;
    if (buttonState !== "normal" && hasCameraPermission) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarcodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === "normal") {
      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled
        >
          <View>
            <Image
              style={{ width: 200, height: 200 }}
              source={require("../assets/booklogo.jpg")}
            />
            <Text style={{ textAlign: "center", fontSize: 30 }}>WiLy</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              placeholder="Book ID"
              style={styles.inputBox}
              value={this.state.scanBookId}
              onChangeText={(text) => {
                this.setState({
                  scanBookId: text,
                });
              }}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermission("BookId");
              }}
            >
              <Text style={styles.scanText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              placeholder="Student ID"
              style={styles.inputBox}
              value={this.state.scanStudentId}
              onChangeText={(text) => {
                this.setState({
                  scanStudentId: text,
                });
              }}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermission("StudentId");
              }}
            >
              <Text style={styles.scanText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              this.handleTransaction();
            }}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }

  getCameraPermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermission: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },
  scanButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 10,
  },
  scanText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    color: "white",
  },
  inputView: {
    flexDirection: "row",
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
    borderRadius: 5,
    padding: 10,
  },
  scanButton: {
    backgroundColor: "#66BB6A",
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#FBC02D",
    width: 100,
    height: 50,
    borderRadius: 5,
  },
  submitButtonText: {
    padding: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
