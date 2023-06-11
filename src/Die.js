import React, {useCallback, useEffect, useRef } from 'react';
import { TouchableOpacity, View, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

duration = 3500 

const Die = ({ rolling, number, callback }) => {
  const animation = useRef(new Animated.Value(0));

  useEffect(() => {
    // console.log(`state: 
    //   rolling: ${rolling}
    //   number: ${number}
    //   `)
    if (number != null) {
      animateToValue(number, callback)
    } else if (rolling) {
      animateDice();
    } else {
      animateToValue(0)
    }
  }, [rolling, number, animateDice, animateToValue]);

  const animateDice = useCallback(() => {
    Animated.loop(
      Animated.timing(animation.current, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ).start();
  }, []);

  const animateToValue = useCallback((number, callback) => {
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
    loopedAnimation.start(callback)
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', 
    alignItems: "center", }}>
      <LottieView
        progress={animation.current}
        style={{
          height: "100%"
        }}
        speed={1}
        source={require('../assets/dice.json')}
      />
    </View>
  );
};

export default Die;
