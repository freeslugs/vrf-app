import * as Font from "expo-font";
import * as SplashScreen from 'expo-splash-screen';

import { Accelerometer } from 'expo-sensors';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, StyleSheet, View, Animated, Easing, Text, TouchableOpacity, PanResponder, SafeAreaView, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

import { WebView } from 'react-native-webview';

const duration = 3500

const Card = ({ randomNumber, requestId, transactionHash, url, openWebView }) => {
  const [dismissed, setDismissed] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dy: pan.y },
      ],{useNativeDriver: false}),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 50) {
          Animated.timing(pan, {
            toValue: { x: 0, y: 500 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setDismissed(true);
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (dismissed) {
    return <TouchableOpacity onPress={() => {
      setDismissed(false)
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    }}><Text style={{ fontSize: 18, }}>show me the blockchain</Text></TouchableOpacity>
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.card, { transform: [{ translateY: pan.y }] }]}
        {...panResponder.panHandlers}
      >
         <Text style={styles.title}>Random Number</Text>
        <Text style={styles.description}>{randomNumber}</Text>

        <Text style={styles.title}>Request ID</Text>
        <Text style={styles.description}>{requestId}</Text>

      {/*  <Text style={styles.title}>Transaction Hash</Text>
        <Text style={styles.description}>{transactionHash}</Text>*/}

        <TouchableOpacity onPress={openWebView}>
          <Text style={styles.title}>URL</Text>
          <Text style={styles.description}>{url}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  card: {
    // width: 300,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
});

export default function App() {
  const [fontsLoaded] = Font.useFonts({
    "Inter-Black": require("./assets/fonts/Inter-Black.otf"),
    "Inter-SemiBoldItalic":
      "https://rsms.me/inter/font-files/Inter-SemiBoldItalic.otf?v=3.12",
     'TiltPrism-Regular': require('./assets/fonts/TiltPrism-Regular.ttf'),
  });

  const [shaking, setShaking] = useState(false);
  
  const [result, setResult] = useState(null)

  const [soundObject, setSoundObject] = React.useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const animation = useRef(new Animated.Value(0));

  const playMusic = async () => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require('./assets/mario.mp3'));
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      setSoundObject(sound);
    } catch (error) {
      console.error('Failed to play the music', error);
    }
  };

  const stopMusic = async () => {
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        setSoundObject(null);
      } catch (error) {
        console.error('Failed to stop the music', error);
      }
    }
  };

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }

    prepare();

    const subscription = Accelerometer.addListener(handleDeviceMotion);

    return () => {
      subscription.remove();
      soundObject && soundObject.unloadAsync();
    };
  }, []);

  const handleDeviceMotion = ({ x, y, z }) => {
    // Calculate the total acceleration magnitude
    const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    // Define a threshold value to determine a shake
    const shakeThreshold = 1.5;
    if (acceleration > shakeThreshold) {
      setShaking(true)
    }
  };

  useEffect(() => {
    if(shaking) {
      animateDice()
      rollDice()
    }

  }, [shaking]);

  let loopedAnimation = Animated.loop(
    Animated.timing(animation.current, {
      toValue: 1,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false
    })
  );

  animateDice = () => {
    loopedAnimation.start()
  }

  endDice = () => {
    let loopedAnimation = Animated.timing(animation.current, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false
    })
    loopedAnimation.start()
  }

  setRoll = (number) => {
    const frames = [0,24,48,72,96,120]
    const frame = frames[number]
    const value = animation.current.__getValue()

    if(number == 0) {
      loopedAnimation = Animated.timing(animation.current, {
        toValue: 1,
        duration: duration * (1-value),
        easing: Easing.linear,
        useNativeDriver: false
      })
    } else {
      loopedAnimation = Animated.sequence([
        Animated.timing(animation.current, {
          toValue: 1,
          duration: duration * (1-value),
          easing: Easing.linear,
          useNativeDriver: false
        }),
        Animated.timing(animation.current, {
          toValue: frame / 143,
          duration: duration * (1 - (frame / 143)),
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ])
    }
    
    loopedAnimation.start(({finished}) => {  
      setShaking(false)
      stopMusic();
    });
  }

  resetLoop = () => {
    setShaking(false)

    // todo: transition to end of loop
    loopedAnimation = Animated.loop(
      Animated.timing(animation.current, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ); 
    loopedAnimation.start()
  }

  async function makeHttpRequest() {
    try {
      const response = await fetch('https://0xcord.com/api/vrfv2/requestRandomNumber?network=fantom_testnet&numWords=1', {
        method: 'POST',
        headers: {
          'Authorization': 'afb562e6-8a47-4d91-9068-522a65ebdf28'
        }
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(error)
      return { error: error } 
    }
  }

  rollDice = async () => {
    playMusic();
  
    console.log('...hitting the api.')
    const data = await makeHttpRequest();
    if (data.error) {
      console.log("ERRORED OUT SORRY, RESET!")
      setShaking(false)
      return false;
    }

    const { randomNumber } = data;
    console.log(randomNumber)
    const number = randomNumber[0] % 6 
    console.log(number)

    // const number = 3
    // const data = {"randomNumber": ["88358717654014146925202915699279637122262361423757893976031470393372670921312"], "requestId": "84777536122901979736094332040405992414041506429913385762103108554193336342633", "success": true, "transactionHash": "0x58bf5f025957d17f65beb4fd6792a16f1a2a682668a9ac61cc46f8e901be5523", "url": "https://mumbai.polygonscan.com/tx/0xf9ed827b47f11df44c1008c1a5c34d48b0f33fcc1db05e1b874eeb0d953c73e4#eventlog"}

    setResult(data);
    setRoll(number)
  }


  const openWebView = () => {
    setModalVisible(true);
  };

  const closeWebView = () => {
    setModalVisible(false);
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: "center", backgroundColor: '#F5B844' }} onLayout={onLayoutRootView}>
      <View style={{ height: 150, alignItems: "center", padding: 10,  }}>
        <Text style={{ fontFamily: "TiltPrism-Regular", fontSize: 50, marginTop: 40 }}>JUST ROLL</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>Use Chainlink VRF to roll the dice on-chain</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center',  }}>
        <TouchableOpacity onPress={() => setShaking(true)}>
          <LottieView
            progress={animation.current}
            style={{
              width: 200,
              height: 200,
            }}
            speed={1}
            source={require('./assets/dice.json')}
          />
        </TouchableOpacity>
      </View>

      <View style={{ height: 150, marginLeft: 20, marginRight: 20, alignItems: "center" , justifyContent:"center",  }}>
        { !shaking && !result && <Text style={{ fontSize: 18, fontWeight: 'bold', }}>Shake to roll the dice!</Text> }
        { shaking && <Text style={{ fontSize: 18, }}>rolling dice on the blockchain...</Text> }

        { !shaking && result && 
          <Card randomNumber={result.randomNumber} requestId={result.requestId} transactionHash={result.transactionHash} url={result.url} openWebView={openWebView} />
        }
      </View>

      

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" />
          <WebView source={{ uri: result && result.url }} />
          <Button title="Close" onPress={closeWebView} />
        </SafeAreaView>
      </Modal>


    </SafeAreaView>
  );
   
}
