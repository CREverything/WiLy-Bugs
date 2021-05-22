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

export default class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
    };
  }

  userLogin = (email, password) => {
    if (email && password) {
      try {
        firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            Alert.alert("Login Successful!");
            this.props.navigation.navigate("Tab");
          })
          .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            Alert.alert(
              "Something went wrong, please try again with correct crendentials. :)"
            );

            console.log(errorCode);
          });
      } catch (error) {
        console.log(error);
      }
    } else {
      Alert.alert("Enter the email and password correctly.");
    }
  };

  render() {
    return (
      <KeyboardAvoidingView style={{ alignItems: "center", marginTop: 20 }}>
        <View>
          <Image
            source={require("../assets/booklogo.jpg")}
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ textAlign: "center", fontSize: 30 }}>Wily</Text>
        </View>
        <View>
          <TextInput
            style={styles.loginBox}
            placeholder="Your Email"
            keyboardType="email-address"
            onChangeText={(text) => {
              this.setState({ email: text });
            }}
          />
          <TextInput
            style={styles.loginBox}
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
          />
        </View>
        <View>
          <TouchableOpacity style={styles.loginButton}>
            onPress=
            {() => {
              this.userLogin(this.state.email, this.state.password);
            }}
            {/* <Text style={styles.loginText}>Login Screen</Text> */}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
  loginButton: {
    height: 30,
    width: 90,
    borderWidth: 1,
    marginTop: 20,
    paddingTop: 5,
    borderRadius: 7,
  },

  loginText: {
    textAlign: "center",
  },
});
