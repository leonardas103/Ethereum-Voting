'use strict';

// Session namespace
var Session = {}
var contract_time = 20;

function setErrorMessage(message) {
  Session.spanErrorMessage.textContent = message
}

async function init() {
  Session.btnStartSession = document.getElementById("btn_start_voting")
  Session.btnStartSession.addEventListener("click", startSession)
  Session.btnEndSession = document.getElementById("btn_end_voting")
  Session.btnEndSession.addEventListener("click", endSession)

  Session.inpUserAddress = document.getElementById("inp_user_address")
  Session.inpContractAddress = document.getElementById("inp_contract_address")

  Session.spanErrorMessage = document.getElementById("span_error_message")

  await checkMetamask()
  Session.inpUserAddress.value = web3.eth.defaultAccount

  Session.abi = getSessionABI()
}

// Updates the account/contract information and verifies the contract address and ticket numbers
function update() {
  // Update user account
  Session.inpUserAddress.value = web3.eth.defaultAccount

  // Update Contract
  if (!web3.isAddress(Session.inpContractAddress.value)) {
    setErrorMessage("Invalid contract address")
    return false;
  }
  Session.contractAddress = Session.inpContractAddress.value
  Session.contractInstance = web3.eth.contract(Session.abi).
    at(Session.contractAddress)
  Session.contractInstance.defaultAccount = web3.eth.defaultAccount;

  setErrorMessage("")
  return true
}

function startSession() {
  if (!update()) { return }

  Session.contractInstance.startSession.
  sendTransaction(contract_time, //Default time 60 seconds
    {
      from: web3.eth.defaultAccount,
      gasPrice: "3000000"
    },
    (error, transactionHash) => {
      if (error) {setErrorMessage("Transaction failed")}
    })
}

//TODO: clear the timer if the button is pressed again
function startTimer(){
  var deadline = new Date(Date.parse(new Date()) + contract_time*1000);
  initializeClock('countdown', deadline);
}

function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);

  function updateClock() {
    var t = getTimeRemaining(endtime);
    clock.innerHTML = t.days + "d " + t.hours + "h "
      + t.minutes + "m " + t.seconds + "s ";
    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}


function endSession() {
  if (!update()) { return }

  Session.contractInstance.endSession.
  sendTransaction(
    {
      from: web3.eth.defaultAccount,
      gasPrice: "3000000"
    },
    (error, transactionHash) => {
      if (error) {setErrorMessage("Transaction failed")}
    })
}

window.addEventListener('load', async () => {
  init()
})
