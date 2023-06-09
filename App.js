import { Accelerometer } from 'expo-sensors';
import React, { useRef, useState, useEffect } from 'react';
import { Button, StyleSheet, View, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

export default function App() {
  const animation = useRef(new Animated.Value(0));
  const [shaking, setShaking] = useState(false);

  const duration = 3500
  // shaking = false

  useEffect(() => {
    const subscription = Accelerometer.addListener(handleDeviceMotion);

    return () => {
      subscription.remove();
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
      setTimeout(() => {
        rollDice()
      }, 3500);
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

  setRoll = (number) => {
    const frames = [0,24,48,72,96,120]
    const frame = frames[number - 1]
    const value = animation.current.__getValue()

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

    loopedAnimation.start(({finished}) => {  
      setShaking(false)
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

  rollDice = () => {
    const min = 1;
    const max = 6;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    setRoll(num)
  }

  return (
    <View style={styles.animationContainer}>
      <LottieView
        progress={animation.current}
        style={{
          width: 200,
          height: 200,
        }}
        speed={1} 
        source={require('./assets/dice.json')}
      />
      <View style={styles.buttonContainer}>
        <Button

          title="Roll dice"
          onPress={rollDice}
          disabled={shaking}
        />
        <Button
          title="Reset"
          onPress={resetLoop}
        />
      </View>
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
