import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import BookTransactionScreen from "./screens/BookTransactionScreen";
import SearchScreen from "./screens/SearchScreen";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import LoginScreen from "./screens/LoginScreen";

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const Tabs = createBottomTabNavigator(
  {
    Transaction: { screen: BookTransactionScreen },
    Search: { screen: SearchScreen },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: () => {
        const route = navigation.state.routeName;

        if (route == "Transaction") {
          return (
            <Image
              style={{ width: 40, height: 40 }}
              source={require("./assets/book.png")}
            />
          );
        } else if (route == "Search") {
          return (
            <Image
              style={{ width: 40, height: 40 }}
              source={require("./assets/searchingbook.png")}
            />
          );
        }
      },
    }),
  }
);

const Navigator = createSwitchNavigator({
  LoginScreen: { screen: LoginScreen },
  Tab: { screen: Tabs },
});

const AppContainer = createAppContainer(Navigator);
