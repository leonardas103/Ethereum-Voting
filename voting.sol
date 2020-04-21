pragma solidity ^0.6.0;

contract Voting {
    address payable owner;
    bool active;
    bool votingClosed;
    uint votePot;
    uint sessionNumber;
    uint drawTime;
    mapping (uint => mapping (uint => address payable[])) ballots;
    
    constructor() public {
        owner = msg.sender;
        active = false;
        sessionNumber = 0;
    }
    
    function getPot() public view returns (uint){
        return votePot;
    }
    
    function getRound() public view returns (uint){
        return sessionNumber;
    }
    
    function startSession(uint time) public {
        require(msg.sender == owner, "Not the owner");
        require(!active, "A vote session is still active");

        drawTime = block.timestamp + time;
        active = true;
        votingClosed = false;
    }

    function castVote(uint vote) public payable {
        require(active, "No Voting Session is active at the moment");
        require(!votingClosed, "Voting session is closed");
        require(msg.value >= 400000000000000, "The vote cost 0.0004 ETH was not paid");

        votePot += msg.value;
        ballots[sessionNumber][vote].push(msg.sender);
    }
    
        function castVoteFREE(uint vote) public  {
        require(active, "No Voting Session is active at the moment");
        require(!votingClosed, "Voting session is closed");
        ballots[sessionNumber][vote].push(msg.sender);
    }
    
    function endSession() public {
        require(block.timestamp > drawTime, "Too early to end the voting");
        require(active, "No Voting Session is active at the moment");
        require(!votingClosed, "The Voting Session has already ended");

        votingClosed = true;
        active = false;
        determineWinner();
    }
    
    function determineWinner() private{
        address payable[] memory voteYes = ballots[sessionNumber][1];
        address payable[] memory voteNo = ballots[sessionNumber][0];
        uint numVoteYes = voteYes.length;
        uint numVoteNo = voteNo.length;
        sessionNumber += 1;
        
        if (numVoteYes>numVoteNo) {
            emit votingEnd(sessionNumber, 111);
        } 
        
        if(numVoteYes<numVoteNo){
            emit votingEnd(sessionNumber, 222);
        }
        
        if(numVoteYes==numVoteNo){
            emit votingEnd(sessionNumber, 999);
        }
    }
    
    event votingEnd(
        uint indexed sessionNumber,
        uint winningVote
    );

}
