const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');


function lorenzSystem( sigma, rho, beta, d) {
  
  var z = d.getSeconds();
  var y = d.getMinutes();
  var x = d.getHours();

  
   var x2 = sigma * (y - x),
      y2 = x * (rho - z) - y,
      z2 = x * y - (beta * z);
  // Returns cartesian distance squared for lorenz system at a point in time

  if((x2 + y2 + z2)*(x2+y2+z2) % 4001 || Math.floor((x2 + y2 + z2)*(x2+y2+z2)/10000) <= 0){
    return 1;
  }


  return Math.floor((x2 + y2 + z2)*(x2+y2+z2)/10000);
}



class Block {
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }

  toString() {
    return `Block -
      Timestamp : ${this.timestamp}
      Last Hash : ${this.lastHash.substring(0, 10)}
      Hash      : ${this.hash.substring(0, 10)}
      Nonce     : ${this.nonce}
      Difficulty: ${this.difficulty}
      Data      : ${this.data}`;
  }

  static genesis() {
    return new this('In the begining', 'Liamisacoder', 'f1r57-h45h', [], 0, DIFFICULTY);
  }

  static mineBlock(lastBlock, data) {
    let hash, timestamp;
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
  }

  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }

  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    var d = new Date(lastBlock.timestamp);
    if(d.getDay() > 5){//works special on friday and saturday
      difficulty = lorenzSystem(10, 28, 8/3, d);
      //console.log("it is this hard", difficulty);
      return difficulty;
    }
    else{
      
      difficulty = lastBlock.timestamp + MINE_RATE > currentTime ?
        difficulty + 1 : difficulty - 1;
      return difficulty;
    }

  
  }
}

module.exports = Block;