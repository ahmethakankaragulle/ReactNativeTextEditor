import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Keyboard,
  Share,
  ToastAndroid,
  ToastIOS,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const TextEditor = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  var [textFocus, setTextFocus] = useState(false);
  const textInputRef = useRef(null);
  const [fontSizeValue, setFontSizeValue] = useState(16);
  const fontSizeMaxValue = 28;
  const fontSizeMinValue = 16;
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [BoldIsActive, setBoldIsActive] = useState(false);
  const [ItalicIsActive, setItalicIsActive] = useState(false);
  const [UnderlineIsActive, setUnderlineIsActive] = useState(false);

  const [styleRanges, setStyleRanges] = useState([]);
  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  });

  const fontStylesJson = {
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    underline: { textDecorationLine: "underline" },
  };

  //Klavyenin durumunu güncelliyoruz
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardShown(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardShown(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  //Butonların aktifliğini değiştiriyoruz
  const setIsActive = (Button, state) => {
    if (Button == "bold") {
      state ? setBoldIsActive(true) : setBoldIsActive(false);
    } else if (Button == "italic") {
      state ? setItalicIsActive(true) : setItalicIsActive(false);
    } else if (Button == "underline") {
      state ? setUnderlineIsActive(true) : setUnderlineIsActive(false);
    } else return false;
  };

  //Butonların durumunu getiriyoruz
  const getButtonState = (Button) => {
    if (Button == "bold") {
      return BoldIsActive;
    } else if (Button == "italic") {
      return ItalicIsActive;
    } else if (Button == "underline") {
      return UnderlineIsActive;
    } else return false;
  };

  //Tüm butonları pasifleştiriyoruz
  const setIsDeActive = () => {
    setBoldIsActive(false);
    setItalicIsActive(false);
    setUnderlineIsActive(false);
  };

  //Text inputta yapılan değişikliklere göre stilleri güncelliyoruz
  const handleTextChange = (newText) => {
    setStyleRanges((prevRanges) => {
      let cursorIndex = selection.start;
      let newRanges = [...prevRanges];
      const difference = newText.length - text.length;
      setText(newText);
      // Silinen metnin tamamı, bir stil aralığının içinde mi kontrol ediyoruz
      const deletedRange = newRanges.find(
        (range) => range.start == cursorIndex + 1
      );
      if (deletedRange) {
        // Stil aralığı tamamen silindi
        newRanges = newRanges.filter((range) => range !== deletedRange);
      } else {
        // Değişiklik yapılan metnin stil aralığını güncelliyoruz
        newRanges = newRanges.map((range) => {
          if (range.start > cursorIndex) {
            return {
              start: range.start + difference,
              end: range.end + difference,
              style: range.style,
            };
          } else if (range.start <= cursorIndex && range.end >= cursorIndex) {
            if (getButtonState(range.style)) {
              return {
                start: range.start,
                end: range.end + difference,
                style: range.style,
              };
            } else {
              return {
                start: range.start,
                end: range.end,
                style: range.style,
              };
            }
          } else {
            return range;
          }
        });
      }
      return newRanges;
    });
  };

  //Butonlara basıldığında seçilen alanın stilini ayarlıyoruz
  const setStyleRange = (style, button) => {
    if (getButtonState(button)) {
      setIsActive(button, false);
    } else {
      setIsActive(button, true);
      const start = selection.start;
      const end = selection.end;
      const newStyleRange = { start, end, style };
      setStyleRanges([...styleRanges, newStyleRange]);
    }
  };

  //Font boyutunu ayarlıyoruz
  const setFontSize = (value) => {
    if (value == 4) {
      if (fontSizeValue < fontSizeMaxValue)
        setFontSizeValue(fontSizeValue + value);
    } else {
      if (fontSizeValue > fontSizeMinValue)
        setFontSizeValue(fontSizeValue + value);
    }
  };

  //Seçilen alana göre butonların durumunu ayarlıyoruz
  const styleInRange = () => {
    const cursorStart = selection.start;
    const cursorEnd = selection.end;
    setIsDeActive(); //Tüm butonları pasifleştiriyoruz
    if (cursorStart == cursorEnd) {
      const cursorIndex = cursorStart;
      styleRanges.map((range) => {
        if (range.start <= cursorIndex && range.end >= cursorIndex) {
          setIsActive(range.style, true);
        }
      });
    } else {
      styleRanges.map((range) => {
        if (
          (range.start >= cursorStart && range.end <= cursorEnd) ||
          (range.start <= cursorStart && range.end >= cursorEnd)
        ) {
          setIsActive(range.style, true);
        }
      });
    }
  };

  //Stilleri jsondan çekiyoruz
  const getFontStyle = (style) => {
    if (fontStylesJson.hasOwnProperty(style)) {
      return fontStylesJson[style];
    }
  };

  const shareText = () => {
    if (text.length > 0) {
      Share.share({
        message: text,
      })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    } else {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Burada paylaşılacak bir şey yok",
          ToastAndroid.SHORT
        );
      } else {
        ToastIOS.show("Burada paylaşılacak bir şey yok");
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity>
            <Ionicons
              name="arrow-back-outline"
              style={styles.topIcon}
            ></Ionicons>
          </TouchableOpacity>
        </View>

        {textFocus && keyboardShown ? (
          <View style={styles.topBarRight}>
            <TouchableOpacity>
              <Text style={[styles.saveButton, styles.topIcon]}>Bitti</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.topBarRight}>
            <TouchableOpacity onPress={shareText}>
              <Ionicons name="share-outline" style={styles.topIcon}></Ionicons>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{ flex: 1, flexDirection: "column" }}>
        <TextInput
          style={styles.titleInput}
          placeholder="Başlık"
          value={title}
          onChangeText={setTitle}
        />

        <ScrollView style={{ maxHeight: "80%" }}>
          <TextInput
            ref={textInputRef}
            onChangeText={handleTextChange}
            style={[styles.textInput, { fontSize: fontSizeValue }]}
            placeholder="Notunuzu buraya yazın"
            multiline
            textAlignVertical={"top"}
            onFocus={() => setTextFocus(true)}
            onBlur={() => setTextFocus(false)}
            onSelectionChange={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              const { selection } = nativeEvent;
              setSelection(selection);
              styleInRange();
            }}
          >
            {text.split("").map((char, index) => {
              const characterStyle = [];
              styleRanges.map((range) => {
                if (range.start <= index && range.end > index) {
                  characterStyle.push(range.style);
                }
              });
              if (characterStyle) {
                var styles = [];
                characterStyle.forEach((style) => {
                  styles.push(getFontStyle(style));
                });
                return (
                  <Text key={index} style={styles}>
                    {char}
                  </Text>
                );
              } else {
                return <Text key={index}>{char}</Text>;
              }
            })}
          </TextInput>
        </ScrollView>
        {textFocus && keyboardShown ? (
          <View style={styles.fontStyleBar}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setFontSize(4)}
              style={[styles.styleButton]}
            >
              <MaterialCommunityIcons
                name="format-font-size-increase"
                style={[
                  fontSizeValue == fontSizeMaxValue
                    ? styles.deactiveButton
                    : styles.activeButton,
                  styles.styleButton,
                  { fontSize: 25, padding: 0 },
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setFontSize(-4)}
              style={[styles.styleButton]}
            >
              <MaterialCommunityIcons
                name="format-font-size-decrease"
                style={[
                  fontSizeValue == fontSizeMinValue
                    ? styles.deactiveButton
                    : styles.activeButton,
                  styles.styleButton,
                  { fontSize: 25, padding: 0 },
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setStyleRange("bold", "bold")}
              style={[styles.styleButton]}
            >
              <Feather
                name="bold"
                style={[
                  BoldIsActive ? styles.activeButton : styles.deactiveButton,
                  styles.styleButton,
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStyleRange("italic", "italic")}
              style={[styles.styleButton]}
            >
              <Feather
                name="italic"
                style={[
                  ItalicIsActive ? styles.activeButton : styles.deactiveButton,
                  styles.styleButton,
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStyleRange("underline", "underline")}
              style={[styles.styleButton]}
            >
              <Feather
                name="underline"
                style={[
                  UnderlineIsActive
                    ? styles.activeButton
                    : styles.deactiveButton,
                  styles.styleButton,
                ]}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View></View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
    top: 25,
  },
  titleInput: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 28,
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    padding: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    height: 45,
    paddingHorizontal: 8,
  },
  topBarLeft: {
    flex: 1,
    justifyContent: "center",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 30,
  },
  topIcon: {
    fontSize: 25,
    marginRight: 15,
    minHeight: 30,
  },
  saveButton: {
    fontSize: 20,
    color: "#000",
    marginLeft: 25,
  },
  fontStyleBar: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F5F5F5",
    bottom: 15,
    left: -10,
    padding: 5,
    width: "110%",
  },
  styleButton: {
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    padding: 5,
    fontSize: 20,
  },
  activeButton: {
    color: "#000",
  },
  deactiveButton: {
    color: "#A6A6A6",
  },
});

export default TextEditor;
