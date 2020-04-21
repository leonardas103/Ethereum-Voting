'use strict';

// Session namespace
var Session = {}

function buyTicket() {
  // Check inputs
  if (!update()) { return }

  Session.contractInstance.castVote.
  sendTransaction(Session.number,
    {
      from: web3.eth.defaultAccount,
      gasPrice: "3000000",
      value: web3.toWei("0.0004", "ether")
    },
    (error, transactionHash) => {
      if (error) {
        setErrorMessage("Transaction failed")
      } else {
        setErrorMessage("")
      }
    })
}

// Get ticket numbers from input boxes
function getNumbers() {
  var inputNumber = document.getElementsByClassName("inp_number")[0].value
  var number = parseInt(inputNumber)
  console.log({numb: number})
  return number
}

function setErrorMessage(message) {
  Session.spanErrorMessage.textContent = message
}

async function init() {
  Session.btnBuyTicket = document.getElementById("btn_buy_ticket")
  Session.inpUserAddress = document.getElementById("inp_user_address")
  Session.inpContractAddress = document.getElementById("inp_contract_address")
  Session.spanErrorMessage = document.getElementById("span_error_message")
  Session.btnBuyTicket.addEventListener("click", buyTicket)
  Session.abi = getSessionABI()

  await checkMetamask()
  Session.inpUserAddress.value = web3.eth.defaultAccount
}

// Updates the account/contract information and verifies the contract address and ticket numbers
function update() {
  // Update user account
  Session.inpUserAddress.value = web3.eth.defaultAccount

  // Update Contract
  if (!web3.isAddress(Session.inpContractAddress.value)) {
    setErrorMessage("Invalid contract address")
    return false
  }
  Session.contractAddress = Session.inpContractAddress.value
  Session.contractInstance = web3.eth.contract(Session.abi).
    at(Session.contractAddress)
  Session.contractInstance.defaultAccount = web3.eth.defaultAccount

  // Update numbers
  Session.number = getNumbers()
  if (isNaN(Session.number)) {
    console.log({"Invalid number": Session.number})
    setErrorMessage("Invalid number")
    return false
  }

  // Check if event is already watched
  if (!Session.isWatching) {
    Session.isWatching = true;
    attachSessionEndEvent()
  }

  Session.potInterval = setInterval(getPot, 1000);

  setErrorMessage("")
  return true
}

function getPot() {
  Session.contractInstance.getPot.call(function(error, result) {
    if (result.c !== 0) {
       result.e = result.e-18
    }
    document.getElementById("span_pot").innerHTML = "Current pot: " + result.toString() + " ether"
  })
}

function attachSessionEndEvent() {
  // Attach endSession event
  var SessionEndEvent = Session.contractInstance.votingEnd()
  SessionEndEvent.watch(function(error,result) {
    SessionEndEvent.stopWatching()
    Session.isWatching = false;
    if (!error) {
      console.log(result)
      console.log({"winner": result.args.winningVote.c.toString()})
      onEndSession(result.args.sessionNumber.c.toString(), result.args.winningVote.c.toString(),)
    } else {
      console.log(error)
    }
  })
}

function onEndSession(sessionNumber, winningVote) {
  //clearInterval(Session.potInterval)
  alert(`Voting has ended\nWinning vote: ${winningVote}\nSession:${sessionNumber}`);
}

window.addEventListener('load', async () => {
  init()
})
