
const cluster = require ('cluster')
const fs = require('fs')

if (cluster.isMaster) {
  console.log('starting master')
  const spawnWorker = function () {
    let worker = cluster.fork();
    return worker
  }

  exports.spawn = function (cnt) {
    for (let i = 0; i < cnt; i++) {
      console.log('spawning worker.....')
      spawnWorker()
      console.log('worker spawned')
    }
  }
}
else {
  const result = simulation(1000);
  fs.appendFile('./logs/text.txt', result.toString()+ '\n', (err) => {
    console.log(err);})
}
/*
* Before fix
*/
// Split validators into committees
// Select randomly committees to attest for each slot
// Compare
/**
 * Each block is 12 seconds
 * 12*5 - 5 blocks per minute
 * 12*5*60 - 5*60 blocks per hour
 * 12*5*60*24 - 5*60*24 blocks per day
 * */
//simulation(2500);
function drawBall(redBalls, blackBalls) {
  return Math.random() <= redBalls/(redBalls+blackBalls) ? 1 : 0;
}
function simulation(rounds) {
  // Accumulating array to represent how often the attack of length (index + 1) occurred
  let length = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // Loop over how many epochs should be generated
  [...(new Array(rounds))].forEach((_) => {
    // Initial set up up of validator distribution
    let redBalls = 96000;
    let blackBalls = 224000;
    // Initial Epoch state, each value within this array represents a slot
    const epoch = [];
    // Generate an epoch with 32 slots
    [...(new Array(32))].forEach((_, ind) => {
      let drawnRedBalls = 0;
      let isBlockCreatorRed = false;
      if (drawBall(redBalls, blackBalls) === 1) {
        // The first validator to be drawn is the block creator
        isBlockCreatorRed = true;
        drawnRedBalls++;
        redBalls--;
      } else {
        blackBalls--;
      }
      // Select 1/32 from the total number of validators (redBalls+blackBalls)/32
      for (let i = 0; i < 10000-1; i++) {
        // Whether the ball is red | (drawBall === 1) iff the ball is red
        if (drawBall(redBalls, blackBalls) === 1) {
          drawnRedBalls++;
          redBalls--;
        } else {
          blackBalls--;
        }
      }
      // We only record the red balls drawn at this slot as the black one can be calculated
      epoch.push({
        red: drawnRedBalls,
        isOwnedByRed: isBlockCreatorRed
      })
    })

    // All slots are drawn
    const localLength = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    epoch.forEach((slot, index) => {
      if(slot.isOwnedByRed){
        //reorg 1:
        let flag = slot.isOwnedByRed;
        let sumOfRed = slot.red;
        let currentIndex = index;
        while(flag && currentIndex !== 0) {
          if (epoch[currentIndex - 1].isOwnedByRed) {
            sumOfRed += epoch[currentIndex - 1].red
            currentIndex -= 1
          } else {
            flag = false;
          }
        }

        let lengthOfAttack = 0;
        let attackFlag = true;
        let attackCurrentIndex = index;
        let sumOfBlack = 0;
        while(attackFlag && attackCurrentIndex !== 31) {
          sumOfBlack += 10000 - epoch[attackCurrentIndex + 1].red;
          sumOfRed += epoch[attackCurrentIndex + 1].red;
          if(sumOfRed > sumOfBlack) {
            lengthOfAttack += 1;
            attackCurrentIndex += 1;
          } else {
            attackFlag = false;
          }
        }
        if (lengthOfAttack > 0) {
          [...new Array(lengthOfAttack)].forEach((l, index) => {
            localLength[index] += 1
          })
        }
      }
    })
    localLength.forEach((number, index) => {
      if (number !== 0) {
        length[index] += 1
      }
    })
  });
  //console.log(length)
  //return length.map(x => x/rounds);
  return length;
}



/*
* After fix
*/
//simulationAfterFix(5*60*24);

function simulationAfterFix(rounds) {
  // Accumulating array to represent how often the attack of length (index + 1) occurred
  let length = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // Loop over how many epochs should be generated
  [...(new Array(rounds))].forEach((_, index) => {
    // Initial set up up of validator distribution
    let redBalls = 96000;
    let blackBalls = 224000;
    // Initial Epoch state, each value within this array represents a slot
    const epoch = [];
    // Generate an epoch with 32 slots
    [...(new Array(32))].forEach((_, ind) => {
      let drawnRedBalls = 0;
      let isBlockCreatorRed = false;

      if (drawBall(redBalls, blackBalls) === 1) {
        // The first validator to be drawn is the block creator
        isBlockCreatorRed = true;
        drawnRedBalls++;
        redBalls--;
      } else {
        blackBalls--;
      }
      if (drawBall(redBalls, blackBalls) === 1) {
        // The first validator to be drawn is the block creator
        drawnRedBalls++;
        redBalls--;
      } else {
        isBlockCreatorRed = false;
        blackBalls--;
      }
      // Select 1/32 from the total number of validators (redBalls+blackBalls)/32
      for (let i = 0; i < 10000; i++) {
        // If the ball is red (drawBall === 1) iff the ball is red
        if (drawBall(redBalls, blackBalls) === 1) {
          // The first validator to be drawn is the block creator
          drawnRedBalls++;
          redBalls--;
        } else {
          blackBalls--;
        }
      }
      // We only record the red balls drawn at this slot as the black one can be calculated
      epoch.push({
        red: drawnRedBalls,
        isOwnedByRed: isBlockCreatorRed
      })
    })

    // All slots are drawn
    const localLength = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    epoch.forEach((slot, index) => {
      if(slot.isOwnedByRed){
        //reorg 1:
        let flag = slot.isOwnedByRed;
        let sumOfRed = slot.red;
        let currentIndex = index;
        while(flag && currentIndex !== 0) {
          if (epoch[currentIndex - 1].isOwnedByRed) {
            sumOfRed += epoch[currentIndex - 1].red
            currentIndex -= 1
          } else {
            flag = false;
          }
        }

        let lengthOfAttack = 0;
        let attackFlag = true;
        let attackCurrentIndex = index;
        let sumOfBlack = 0;
        while(attackFlag && attackCurrentIndex !== 31) {
          sumOfBlack += 10000 - epoch[attackCurrentIndex + 1].red;
          sumOfRed += epoch[attackCurrentIndex + 1].red;
          if(sumOfRed > sumOfBlack) {
            lengthOfAttack += 1;
            attackCurrentIndex += 1;
          } else {
            attackFlag = false;
          }
        }
        if (lengthOfAttack > 0) {
          [...new Array(lengthOfAttack)].forEach((l, index) => {
            localLength[index] += 1
          })
        }
      }
    })
    localLength.forEach((number, index) => {
      if (number !== 0) {
        length[index] += 1
      }
    })
  });
  console.log(length)
  return length.map(x => x/rounds);
}

