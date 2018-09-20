const bel = require('bel')
const csjs = require('csjs-inject')

var ABI = require('./abi.json');
var Web3 = require('web3');

if(localStorage.web3 === 'dev') {
  console.log('=== dev');
  web3 = new Web3("ws://localhost:8545");
} else {
  if (typeof web3 !== 'undefined') {
    console.log('=== 1');
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('=== 2');
    // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    web3 = new Web3("ws://localhost:8545");
  }
}

const contractAddress = "0x688dca6b2f0c809139b04b5d3f36cba31294efb1";
const CONTRACT_GAS = 400000;
const CONTRACT_PRICE = 40000000000;
const MINIMIZE_SIGNUP_AMOUNT = 0.1

myContract = new web3.eth.Contract(ABI, contractAddress);

const log = console.log;

/******************************************************************************
  SETUP
******************************************************************************/
const css = csjs`
  .box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 100px;
  }
  .box1 {
    grid-column-start: 1;
    grid-column-end: 4;
    grid-row-start: 1;
    grid-row-end: 3;
    text-align: center;
  }
  .box2 {
      grid-column-start: 1;
      grid-row-start: 3;
      grid-row-end: 5;
  }
  .box3 {
      grid-column-start: 2;
      grid-column-end: 4;
      grid-row-start: 3;
      grid-row-end: 5;
      color: #00529B;
      background-color: #BDE5F8;
      padding: 20px;
  }
  .box4 {
      grid-column-start: 2;
      grid-column-end: 4;
      grid-row-start: 5;
      grid-row-end: 7;
      color: #4F8A10;
      background-color: #DFF2BF;
      padding: 20px;
  }
  .box5 {
    grid-column-start: 1;
    grid-column-end: 4;
    grid-row-start: 6;
    grid-row-end: 7;
    text-align: center;
  }
  .input {
    margin: 10px;
    width: 50px;
    font-size: 20px;
  }
  .button {
    margin-top: 10px;
    font-size: 20px;
    width: 200px;
    background-color: #4CAF50;
    color: white;
  }
  .highlight {
    color: red;
  }
  img {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
    width: 150px;
  }

  .info, .success, .warning, .error, .validation {
    border: 1px solid;
    margin: 10px 0px;
    padding: 15px 10px 15px 50px;
    background-repeat: no-repeat;
    background-position: 10px center;
  }
  .info {
    color: #00529B;
    background-color: #BDE5F8;
    background-image: url('https://i.imgur.com/ilgqWuX.png');
  }
  .success {
    color: #4F8A10;
    background-color: #DFF2BF;
    background-image: url('https://i.imgur.com/Q9BGTuy.png');
  }
  .warning {
    color: #9F6000;
    background-color: #FEEFB3;
    background-image: url('https://i.imgur.com/Z8q7ww7.png');
  }
  .error {
    color: #D8000C;
    background-color: #FFBABA;
    background-image: url('https://i.imgur.com/GnyDvKN.png');
  }
  .validation {
    color: #D63301;
    background-color: #FFCCBA;
    background-image: url('https://i.imgur.com/GnyDvKN.png');
  }
`

/******************************************************************************
  Create Element
******************************************************************************/

// player

function batAreaElement(result) {
  if (result.isSigned){
    return bel`
    <div>
      You successfully <span class="${css.highlight}">joined</span> the contest.<br>
      <button class=${css.button} onclick=${updateStep}> Allow us to update your step data from fitbit </button><br>
      Your current amount of steps ${result.beginStep - result.endStep}<br>
      ()
    </div>`;
  } else {
    return bel`
    <div class="${css.box3}">
      I bet that I can reach 10.000 steps each day! (GOAL: 300.000 steps a month)<br>
      <button class=${css.button} onclick=${bet}> Bet</button> (joining fee 0.1 ETH)
    </div>
    `
  }
}

// funder

const fundAmountElement = bel`
  <input class=${css.input} type="text"/>
`
const fundNameElement = bel`
  <input class=${css.input} type="text"/>
`
const fundAreaElement = bel`
  <div class="${css.box4}">
    I want to sponsor this contest with ${fundAmountElement} ETH!<br>
    Name you want to be added to our sponsorship board. ${fundNameElement}<br>
    <button class=${css.button} onclick=${fund}> Fund </button> (min 0.1 ETH)
  </div>
`

function debugAreaElement(result) {
  if (localStorage.debug == "true") {
    return bel`
    <div class="${css.box5}">
      <button class=${css.button} onclick=${getFitbitToken}"> Get Token </button>
      <button class=${css.button} onclick=${getProfile}"> Get Profile </button>
      <button class=${css.button} onclick=${getTotalStep}"> Get Step </button>
      <button class=${css.button} onclick=${clearResult}"> Clear </button><br><br>
      <a href="https://rinkeby.etherscan.io/address/${contractAddress}">etherscan</a>
    </div>`;
  } else {
    return;
  }
}

function errorRender(errorMessage) {
  console.error(errorMessage);
  document.body.appendChild(bel`
  <div class=${css.error} id="app">
    ${errorMessage}
  </div>
 `)
}

function adminAreaElement(result) {
  if (!result.isOwner) return;
  return bel`
  <div>
    <button class=${css.button} onclick=${contestDone}"> Contest Done </button>
    <button class=${css.button} onclick=${ownerWithdrawal}"> Owner Withdrawal </button>
  </div>`;
}

function render(result) {
  document.body.appendChild(bel`
  <div class=${css.box} id="app">
    <div class=${css.box1}>
      Please choose the <span class="${css.highlight}">Rinkeby test chain.</span> You could get test coin from <a href="https://faucet.rinkeby.io/">here</a>.
      <br><br>
      ${adminAreaElement(result)}
      <br><br><br>
      <div>
        <b>Welcome</b> to the Fitbit wellness contest.<br>
        The price money is shared equally between all participate<br>
        who manage to walk 300.000 steps in the next 30 days (10.000 steps per day)
      </div>
    </div>
    <div class="${css.box2}">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/ETHEREUM-YOUTUBE-PROFILE-PIC.png"/><br/>
      Total players: ${result.numPlayers} <br>
      Total fees: ${web3.utils.fromWei(result.playersOfAmount, "ether")} ETH. <br><br>
      Total funders: ${result.numFunders} <br>
      Total prize amount: ${web3.utils.fromWei(result.fundersOfAmount, "ether")} ETH. <br><br>
    </div>
    ${batAreaElement(result)}
    ${fundAreaElement}
    ${debugAreaElement(result)}
  </div>
 `)
}

if(typeof web3 == 'undefined') {
  const eventHandler = myContract.events.allEvents((error, data) => {
    if (error) console.error(error);
    let { event, returnValues } = data;
    console.log('event:', data);
    let userId = returnValues.userId;
    if (event === 'LOG_OraclizeCallbackName') console.log('callback data:', returnValues);
    if (event === 'LOG_OraclizeCallbackStep') console.log('callback data:', returnValues);
    if (event === 'NewOraclizeQuery') console.log('oraclize log:', returnValues);
  })
}

/******************************************************************************
  Fitbit
******************************************************************************/

if (window.location.hash) {
  var fragmentQueryParameters = {};
  window.location.hash.slice(1).replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function ($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
  );

  console.log('fragmentQueryParameters: ', fragmentQueryParameters);
  localStorage.userId = fragmentQueryParameters.user_id;
  localStorage.fitbitAccessToken = fragmentQueryParameters.access_token;
}

var processResponse = function (res) {
  if (!res.ok) {
    throw new Error('Fitbit API request failed: ' + res);
  }

  var contentType = res.headers.get('content-type')
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  } else {
    throw new Error('JSON expected but received ' + contentType);
  }
}

function isExistToken() {
  return localStorage.fitbitAccessToken && localStorage.fitbitAccessToken.length > 0
}

function showProfile(data) {
  localStorage.userId = data.user.encodedId;
  console.dir(data);
}

function getProfile(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
  fetch(
    'https://api.fitbit.com/1/user/-/profile.json',
    {
      headers: new Headers({
        'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
      }),
      mode: 'cors',
      method: 'GET'
    }
  ).then(processResponse)
    .then(showProfile)
    .catch(function (error) {
      console.error(error);
    });
}

function showTotalStep(data) {
  console.log('step:', data.lifetime.total.steps);
}

function getTotalStep(event) {
  if (!isExistToken()) console.error('the fitbit access token is not found.')
  fetch(
    'https://api.fitbit.com/1/user/-/activities.json',
    {
      headers: new Headers({
        'Authorization': `Bearer ${localStorage.fitbitAccessToken}`
      }),
      mode: 'cors',
      method: 'GET'
    }
  ).then(processResponse)
    .then(showTotalStep)
    .catch(function (error) {
      console.error(error);
    });
}

function getFitbitToken(event) {
  const CLIENT_ID = '22CYSG';
  const EXPIRES_IN = 31536000;
  // const uri = window.location.href;
  const uri = "https://alincode.github.io/devon4";
  const redirectUri = encodeURIComponent(uri);
  window.open(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=activity%20profile&expires_in=${EXPIRES_IN}`, '_blank');

  // window.location.replace(`https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=https%3A%2F%2Falincode.github.io%2Fdevon4&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=${EXPIRES_IN}`);
}

/******************************************************************************
  Event
******************************************************************************/

// player

function bet(event) {
  let betAmount = '0.1';
  if (parseFloat(localStorage.balance) < parseFloat(betAmount)) {
    alert("you don't have enough ether.");
    return;
  }

  const token = localStorage.fitbitAccessToken;
  const userId = localStorage.userId;
  if (!token) {
    localStorage.continueBetAmount = betAmount;
    localStorage.continueEvent = 1;
    getFitbitToken();
    return;
  }

  myContract.methods.signup(token, userId).send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei(betAmount, "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> bet ok.');
    localStorage.removeItem("continueBetAmount");
    localStorage.removeItem("continueEvent");
  })
}

function updateStep(event) {
  if (!localStorage.fitbitAccessToken) {
    localStorage.continueEvent = 2;
    getFitbitToken();
    return;
  }
  myContract.methods.playerWithdrawal(localStorage.fitbitAccessToken, "alincode").send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei("0.01", "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> playerWithdrawal ok.');
    localStorage.removeItem("continueEvent");
  })
}

// funder

function fund(event) {
  let fundAmount = fundAmountElement.value;
  let name = fundNameElement.value;
  if (parseFloat(fundAmount) < MINIMIZE_SIGNUP_AMOUNT) alert("The amount can't low than ", MINIMIZE_SIGNUP_AMOUNT);
  if (parseFloat(localStorage.balance) < parseFloat(fundAmount)) {
    alert("you don't have enough ether.");
    return;
  }
  myContract.methods.fund(name).send({ from: localStorage.wallet, gas: CONTRACT_GAS, gasPrice: CONTRACT_PRICE, value: web3.utils.toWei(fundAmount, "ether") }, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> fund ok.');
  })
}

// owner

function contestDone(event) {
  myContract.methods.done().send({ from: localStorage.wallet}, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> contest done.');
  })
}

function ownerWithdrawal(event) {
  myContract.methods.ownerWithdrawal().send({ from: localStorage.wallet}, (err, data) => {
    if (err) return console.error(err);
    console.log('>>> owner withdrawal');
  })
}

function clearResult(event) {
  localStorage.clear();
  location.reload();
}

/******************************************************************************
  Oraclize
******************************************************************************/
function encrypt(data, next) {
  const init = {
    method: 'POST',
    body: JSON.stringify(data),
  };

  fetch('https://api.oraclize.it/v1/utils/encryption/encrypt', init)
    .then(processResponse)
    .then(next)
    .catch(console.error);
}

// encrypt({ "message": "json(https://api.postcodes.io/postcodes).status" }, function(data) {
//   console.log(data);
// });

/******************************************************************************
  DONE
******************************************************************************/
function done(err, result) {
  if (err) return log(new Error(err))
  const { username } = result
  if (username) {
    log(null, 'success')
    // var el = dapp(result)
    // document.body.appendChild(el)
  } else log(new Error('fail'))
}

/******************************************************************************
  START
******************************************************************************/
function start() {
  getMyAddress({
    fitbitAccessToken: localStorage.fitbitAccessToken
  });
}

function continueProcess() {
  switch (localStorage.continueEvent) {
    case "1":
      bet();
      break;
    case "2":
      updateStep();
      break;
    default:
      break;
  }
}

function getMyAddress(result) {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  log('loading (1/11) - getMyAddress')
  web3.eth.getAccounts((err, localAddresses) => {
    if (!localAddresses) return errorRender('You must be have MetaMask or local RPC endpoint.');
    if (err) return done(err)
    localStorage.wallet = localAddresses[0];
    result.wallet = localAddresses[0];
    getBalance(result);
  })
}

function getBalance(result) {
  log('loading (2/11) - getBalance')
  web3.eth.getBalance(result.wallet, (err, wei) => {
    if (err) return done(err)
    const balance = web3.utils.fromWei(wei, 'ether');
    localStorage.balance = balance
    result.balance = balance;
    getNumPlayers(result);
  })
}

function getNumPlayers(result) {
  log('loading (3/11) - getNumPlayers')
  myContract.methods.getNumPlayers().call((err, data) => {
    if (err) return errorRender('Please switch to Rinkeby test chain!');
    result.numPlayers = parseInt(data, 10);
    getPlayersOfAmount(result);
  })
}

function getPlayersOfAmount(result) {
  log('loading (4/11) - getPlayersOfAmount')
  myContract.methods.getPlayersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.playersOfAmount = data;
    getNumFunders(result);
  })
}

function getNumFunders(result) {
  log('loading (5/11) - getNumFunders')
  myContract.methods.getNumFunders().call((err, data) => {
    if (err) return console.error(err);
    result.numFunders = parseInt(data, 10);
    getFundersOfAmount(result);
  })
}

function getFundersOfAmount(result) {
  log('loading (6/11) - getFundersOfAmount')
  myContract.methods.getFundersOfAmount().call((err, data) => {
    if (err) return console.error(err);
    result.fundersOfAmount = data;
    isSigned(result);
  })
}

function isSigned(result) {
  log('loading (7/11) - isSigned')
  myContract.methods.isSigned(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isSigned = data;
    data ? getBeginStep(result) : isOwner(result);
  })
}

function getBeginStep(result) {
  log('loading (8/11) - getBeginStep')
  myContract.methods.getBeginStep(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.beginStep = data;
    getEndStep(result);
  })
}

function getEndStep(result) {
  log('loading (9/11) - getEndStep')
  myContract.methods.getEndStep(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.endStep = data;
    getContestStep(result);
  })
}

function getContestStep(result) {
  log('loading (10/11) - getContestStep')
  myContract.methods.getContestStep(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.step = (data.length > 20) ? 0 : data;
    isOwner(result);
  })
}

function isOwner(result) {
  log('loading (10/11) - isOwner')
  myContract.methods.isOwner(result.wallet).call((err, data) => {
    if (err) return console.error(err);
    result.isOwner = data;

    console.log('result: ', result);
    continueProcess();
    render(result);
  })
}

start();
