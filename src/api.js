export async function makeHttpRequest(numDice) {
  try {
    const response = await fetch(`https://0xcord.com/api/vrfv2/requestRandomNumber?confirmations=1&network=fantom_testnet&numWords=${numDice}`, {
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
    console.log(error);
    return { error: error };
  }
}


// export async function makeHttpRequest(numDice) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         "randomNumber": [
//           "14851625612895178101869390576875903695117482404945708659740297982302098933746",
//           "5321452245010535275771569650122952262005729455457238951028671720408779225179",
//           "14851625612895178101869390576875903695117482404945708659740297982302098933746",
//           "5321452245010535275771569650122952262005729455457238951028671720408779225179",
//         ],
//         "requestId": "113754484595340510892386381993894911658075059462233128212855153344390586968196",
//         "success": true,
//         "transactionHash": "0x397f8a52f0a968b38864b3b58abe9304b54f1c9b9ab1edb576ace0a7f220346d",
//         "url": "https://testnet.ftmscan.com/tx/0x63f8ee63289016b952393ac82e910c9917ceba46701eb8800d95b0a8c8bcd6d4#eventlog"
//       });
//     }, 1000);
//   });
// }

// export async function makeHttpRequest(numDice) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         error: "sorry we fucked up"
//       });
//     }, 1000);
//   });
// }
