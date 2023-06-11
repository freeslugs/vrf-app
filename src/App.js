import React, { useEffect, useState } from 'react';
import { AppRegistry, View, Text, StyleSheet, TouchableOpacity , SafeAreaView, } from 'react-native';
// import { Appbar, Button } from 'react-native-paper';
import { Appbar, Button, Surface, IconButton, Portal, Dialog, Badge, Card, Modal, ProgressBar, Snackbar } from 'react-native-paper';
import { Accelerometer } from 'expo-sensors';
import { WebView } from 'react-native-webview';

import Die from './Die'
import { makeHttpRequest } from './api';

const styles = StyleSheet.create({
  container: {
   flex: 1, 
    justifyContent: 'center', 
    alignItems: "center", 
    backgroundColor: '#F5B844',
    padding: 20
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    height: 150,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F5B844',
  },
  button: {
    borderRadius: 30,
    marginHorizontal: 8,
  },
  instructionsTitle: {
    color: 'rgb(21, 29, 120)',
    fontSize: 24,
    letterSpacing: 1,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundColor: 'red',
  },
  modalContent: {
    backgroundColor: 'red',
    padding: 16,
    borderRadius: 8,
    flex: 1,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
  },
});

const DiceGrid = ({ numDice, rolling, numbers, callback }) => {
  const numRows = Math.ceil(numDice / 2);
  const diceGrid = [];

  let diceCount = 0;
  for (let i = 0; i < numRows; i++) {
    const diceRow = [];
    for (let j = 0; j < 2; j++) {
      if (diceCount < numDice) {
        diceRow.push(
          <View key={`col-${diceCount}`} style={styles.column}>
            <Die 
              key={`die-${diceCount}`} 
              rolling={rolling} 
              number={numbers && numbers[diceCount]} 
              callback={callback}
            />
          </View>
        );
        diceCount++;
      }
    }
    diceGrid.push(
      <View key={i} style={styles.row}>
        {diceRow}
      </View>
    );
  }

  return <View style={styles.container}>{diceGrid}</View>;
};

export default function App() {
  const [numDice, setNumDice] = useState(2);
  const [rolling, setRolling] = useState(false);
  const [numbers, setNumbers] = useState(null);

  const [result, setResult] = useState(null);

  const incrementNumDice = () => {
    if (numDice < 6) {
      setNumDice(numDice + 1);
      setNumbers(null)
    }
  }

  const decrementNumDice = () => {
    if (numDice > 1) {
      setNumDice(numDice - 1);
      setNumbers(null)
    }
  }

  const handleDeviceMotion = ({ x, y, z }) => {
    // Calculate the total acceleration magnitude
    const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    // Define a threshold value to determine a shake
    const shakeThreshold = 1.5;
    if (acceleration > shakeThreshold) {
      setNumbers(null)
      setResult(null)
      setRolling(true)
      setExpertVisible(false)
    }
  };

  const [loadingText, setLoadingText] = useState(null);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    'Hitting the API',
    'Submitting the transaction to the blockchain',
    'Pinging Chainlink VRF V2',
    'Saving results on-chain',
    'Transferring data back to app',
  ];

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleRoll = async () => {
    // show the loading data
    setProgress(0)
    setLoadingText(loadingMessages[0])
    const interval = setInterval(() => {
      setLoadingText((prevText) => {
        const currentIndex = prevText ? loadingMessages.indexOf(prevText) : -1;
        const nextIndex = currentIndex + 1;
        
        if (nextIndex >= loadingMessages.length) {
          clearInterval(interval); // Stop the interval when all messages have been shown
          return prevText; // Keep showing the last message
        }

        return loadingMessages[nextIndex];
      });

      setProgress((prevProgress) => prevProgress + 0.2);
    }, 5000);
    // Simulate the request completion after 30 seconds
    setTimeout(() => {
      clearInterval(interval); // Stop the interval if the results are received
    }, 30000);

    const data = await makeHttpRequest(numDice);

    if (data.error) {
      setError('houston we have a problem: ' + data.error)
      setRolling(false)
      setNumbers(null)
      setResult(null)
      setLoadingText(null)
      setProgress(0)
      clearInterval(interval)
      return false;
    }

    const { randomNumber } = data;
    const _numbers = randomNumber.map(i => parseInt(i) % 6)
    setNumbers(_numbers)
    setResult(data)

    // console.log(data)
  }
  
  const doneRolling = ({ finished }) => {
    if(finished) {
      setRolling(false)
      // setNumbers(null)
      setLoadingText(null)
      setProgress(0)
    }
  }

  useEffect(() => {
    const subscription = Accelerometer.addListener(handleDeviceMotion);

    return () => {
      subscription.remove();
      // soundObject && soundObject.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if(rolling) {
      handleRoll()
    }

  }, [rolling]);

  const [instructionsVisible, setInstructionsVisible] = React.useState(false);
  const [expertVisible, setExpertVisible] = useState(false);
  const [webVisible, setWebVisible] = useState(false);
  
  const [error, setError] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header >
        <Appbar.Content title="Just Roll"  titleStyle={{ fontFamily: "TiltPrism-Regular", fontSize: 28 }} />
        <Appbar.Action icon="help" onPress={() => setInstructionsVisible(true)} color="white" />
      </Appbar.Header>

      <Portal>
        <Snackbar visible={error} onDismiss={() => setError(null)} duration={3000} action={{
          label: 'x',
          onPress: () => {
            setError(null)
          },
        }}>
          {error}
        </Snackbar> 
      </Portal>

      {/* web modal! */}

      { webVisible && <Portal>
        <View style={{backgroundColor: 'white' , flex: 1}}>
        <WebView source={{ uri: result && result.url }} style={{ flex: 1 }} />
        <Button title="Close" onPress={() => setWebVisible(false)}>Close</Button>
        </View>
      </Portal> }

      {/* instructions dialog */}
      
      <Portal>
        <Dialog visible={instructionsVisible} onDismiss={() => setInstructionsVisible(false)}>
          <Dialog.Title style={{color: 'rgb(21, 29, 120)'}}>How it works</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.instructionsText}>
              Shake your phone to roll the dice.{'\n\n'}
              Each roll is powered by the secure and transparent Chainlink VRF.{'\n\n'}
              Press "Expert Mode" to explore the data on the blockchain.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInstructionsVisible(false)}>Got it!</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* expert modal */}
    
      { !rolling && numbers && result && <Portal>
       <Modal visible={!webVisible && expertVisible} onDismiss={() => setExpertVisible(false)} contentContainerStyle={{backgroundColor: 'white', padding: 20, marginLeft: 20, marginRight: 20, borderRadius: 8,}}>
         <View style={{ flexDirection: 'row', alignItems: 'center'  }}>
           <Badge style={{backgroundColor: 'rgb(21, 29, 120)'}}>1</Badge>
           <Text style={{ marginLeft: 8,  fontWeight: 'bold' }}>Request ID</Text>
         </View>
         <Text style={{marginTop: 8}}>{result.requestId}</Text>

         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
           <Badge style={{backgroundColor: 'rgb(21, 29, 120)'}}>2</Badge>
           <Text style={{ marginLeft: 8,  fontWeight: 'bold' }}>Random Numbers</Text>
         </View>
        <View style={{marginTop: 8}}> 
          { result.randomNumber.map( (n, i) => <Text key={`a-${i}`} style={{fontSize: 10}}>{n}</Text> )}
        </View> 

        <Button /*icon="account-hard-hat"*/ mode="contained" onPress={() => setWebVisible(true)} style={{marginTop: 8}}>
          Open in blockchain explorer
        </Button>

        <View style={{ flexDirection: 'row', alignItems: 'center' , marginTop: 8,  }}>
          <Badge style={{backgroundColor: 'rgb(21, 29, 120)'}}>3</Badge>
          <Text style={{ marginLeft: 8,  fontWeight: 'bold' }}>Mod each by 6 and add 1</Text>
        </View>
        <View style={{marginTop: 8}}> 
          { result.randomNumber.map((n, i) => <Text key={`b-${i}`} style={{  fontSize: 10}}>{n} % 6 = {parseInt(n) % 6} + 1 = {numbers[i] + 1}</Text> )}
        </View> 

       </Modal>
     </Portal> }

      <DiceGrid numDice={numDice} rolling={rolling} numbers={numbers} callback={doneRolling} />
      
      <View style={styles.bottomSection}>
        <IconButton
          icon="minus"
          size={30}
          onPress={decrementNumDice}
          disabled={rolling || numDice == 1}
          mode="contained"
        />

        { rolling && <View style={{flex: 1, marginLeft: 15,  marginRight: 15,}}>
          <ProgressBar progress={progress} />
          <Text>{loadingText}</Text>
        </View> }

        { !rolling && numbers && <Button icon="account-hard-hat"  mode="contained" onPress={() => setExpertVisible(true)}>
          Expert mode
        </Button> } 

        { !rolling && !numbers && <Button mode="contained" onPress={() => setRolling(true)} >Roll</Button> } 

        <IconButton
          icon="plus"
          size={30}
          onPress={incrementNumDice} 
          disabled={rolling || numDice == 6}
          mode="contained"
        />
      </View>

    </View>
  );
}
