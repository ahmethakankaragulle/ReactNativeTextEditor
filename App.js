import { StyleSheet, Text, View } from "react-native";
import TextEditor from "./TextEditor";

export default function App() {
  return <TextEditor></TextEditor>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
