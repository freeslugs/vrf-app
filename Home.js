
import { Accelerometer } from 'expo-sensors';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, StyleSheet, View, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';


// const loadFonts = async () => {
//   await Font.loadAsync({
//     'TiltPrism-Regular': require('./assets/fonts/TiltPrism-Regular.ttf'),
//   });
// };
// SplashScreen.preventAutoHideAsync();

export default function Home() {
  const animation = useRef(new Animated.Value(0));
  const [shaking, setShaking] = useState(false);
  const duration = 3500
  const [result, setResult] = useState(null)

  const [soundObject, setSoundObject] = React.useState(null);

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
    console.log('hitting the api')
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

    setResult(data);
    setRoll(number)
  }

  return (
    <View style={styles.animationContainer}>
      <StatusBar style="auto" />
      <Text style={{ fontFamily: 'TiltPrism-Regular', fontSize: 20 }}>
        Custom Font Text
      </Text>

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
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: '#F5B844',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});
