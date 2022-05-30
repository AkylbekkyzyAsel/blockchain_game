import React, { Component } from 'react';
import Web3 from 'web3'
import MemoryToken from './abis/MemoryToken.json'

const IN_MENU = 0;
  const IN_GAME = 1;
  const PAUSED = 2;
  const VICTORY = 3;
  let SCORE = 0;

  const LEVEL_01 = [
      [ '#', '#', '#', '#', '#', '#', '#', '#', '#' ],
      [ '#', 'D', ' ', ' ', '0', ' ', ' ', 'E', '#' ],
      [ '#', '#', '#', '#', '#', '#', '#', '#', '#' ]
    ];
    
  const LEVEL_02 = [
      [ '#', '#', '#' ],
      [ '#', 'D', '#' ],
      [ '#', ' ', '#' ],
      [ '#', ' ', '#' ],
      [ '#', '0', '#' ],
      [ '#', ' ', '#' ],
      [ '#', ' ', '#' ],
      [ '#', 'E', '#' ],
      [ '#', '#', '#' ]
    ];
    
  const LEVEL_03 = [
      [ '#', '#', '#', '#', '#', '#', '#', '#', '#' ],
      [ '#', 'E', ' ', ' ', ' ', '#', ' ', '0', '#' ],
      [ '#', '#', '#', '#', ' ', '#', ' ', '#', '#' ],
      [ '#', ' ', ' ', ' ', ' ', '#', ' ', ' ', '#' ],
      [ '#', ' ', '#', '#', '#', '#', '#', ' ', '#' ],
      [ '#', ' ', '#', '0', '#', ' ', ' ', ' ', '#' ],
      [ '#', ' ', ' ', ' ', ' ', ' ', '#', ' ', '#' ],
      [ '#', '0', '#', '#', '#', '0', '#', 'D', '#' ],
      [ '#', '#', '#', '#', '#', '#', '#', '#', '#' ]
    ];

  const LEVELS = [LEVEL_01, LEVEL_02, LEVEL_03];
  var levelIndex = 0;

  const IMAGES = {
      wall: {
          src: '/img/wallImage.png',
          image: new Image()
      },
      floor: {
          src: '/img/floorImage.png',
          image: new Image()
      },
      door: {
          src: '/img/doorImage.png',
          image: new Image()
      },
      exitDoor: {
          src: '/img/exitDoorImage.png',
          image: new Image()
      },
      player: {
          src: '/img/player.png',
          image: new Image()
      },
      coin: {
          src: '/img/coin.png',
          image: new Image()
      },
  };

  const KEY_CODE = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
  }

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()

    this.fuck.fuck = this.state
    this.fuck.fuck.getTokenURIs = async () => {
      console.log('FUCK')
          let id = await this.state.token.methods.tokenOfOwnerByIndex(this.state.account, 0).call()
          let tokenURI = await this.state.token.methods.tokenURI(id).call()
          this.setState({
            tokenURIs: [...this.state.tokenURIs, tokenURI]
          })
        
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if(networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      console.log(this.state)
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
    }
  }

  fuck = {
    fuck: null
  }

  // GAME: 
  componentDidMount() {
    const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

function loadImage( ref ) {
    return new Promise((resolve) =>  {
        ref.image.src = ref.src;
        ref.image.onload  = () =>{ ref.status='OK';  resolve() };
    });
}

function image_preload() {
    const arr = [];
    for (let key in IMAGES ){
        arr.push(loadImage(IMAGES[key]));
    }

    Promise.all(arr).then(() => {
        start_game();
    })
}




function drawImage(image, x, y, size){   // load an image function 
    // creates a new i each time it is called
    // now the onload will have the correct variables 
    ctx.drawImage(image, x, y, size, size); 
}

class Board {
    constructor(player) {
        this.player = player;
    }    

    drawBoard(levelIndex) {
        this.level = LEVELS[levelIndex];
        this.width = this.level[0].length;
        this.height = this.level.length;

        const cellPixelSize = Math.min(canvas.width / this.width, canvas.height / this.height) * 0.8
        let gameFieldPixelWidth = cellPixelSize * this.width
        let gameFieldPixelHeight = cellPixelSize * this.height
        let gameFieldCenterShiftX = (canvas.width - gameFieldPixelWidth) / 2
        let gameFieldCenterShiftY = (canvas.height - gameFieldPixelHeight) / 2
        let playerPixelX = 0;
        let playerPixelY = 0;


        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let pixelX = gameFieldCenterShiftX + x * cellPixelSize
                let pixelY = gameFieldCenterShiftY + y * cellPixelSize
                ctx.beginPath();
                var cell = this.level[y][x]
                if (cell == '#') {
                    drawImage(IMAGES.wall.image, pixelX, pixelY, cellPixelSize); 
                } else if (cell == ' ') {
                    drawImage(IMAGES.floor.image, pixelX, pixelY, cellPixelSize);
                    
                } else if (cell == 'D') {
                    player.setBoardCoordinatesOnce(x, y)
                    playerPixelX = pixelX;
                    playerPixelY = pixelY;

                    drawImage(IMAGES.floor.image, pixelX, pixelY, cellPixelSize);
                    drawImage(IMAGES.door.image, pixelX, pixelY, cellPixelSize);
                    
                } else if (cell == 'E') {
                    drawImage(IMAGES.floor.image, pixelX, pixelY, cellPixelSize);
                    drawImage(IMAGES.exitDoor.image, pixelX, pixelY, cellPixelSize);
                    
                } else if (cell == '0') {
                    drawImage(IMAGES.floor.image, pixelX, pixelY, cellPixelSize);   
                    drawImage(IMAGES.coin.image, pixelX, pixelY, cellPixelSize);                 
                } 
                ctx.closePath();
            }
        }
        return [playerPixelX, playerPixelY, cellPixelSize];
    }
};



class Player {
    once = false;
    boardX = 0;
    boardY = 0;

    
    constructor(x, y, size, globalState){
        this.globalState = globalState
        this.x = x
        this.y = y
        this.size = size
    }

    setBoardCoordinatesOnce(boardX, boardY) {
        if (this.once) return;
        this.boardX = boardX;
        this.boardY = boardY;
        this.once = true;
    }

    drawPlayer() {
        drawImage(IMAGES.player.image, this.x, this.y, this.size);
    }

    checkNextStepWall(x1, y1) {
        const level = LEVELS[levelIndex];
        return level[this.boardY + y1][this.boardX + x1] != '#';
    }

    checkNextStepCoin(x1, y1) {
        const level = board.level;
        return level[this.boardY][this.boardX] == '0';
    }

    checkNextStepExitDoor(x1, y1) {
        const level = LEVELS[levelIndex];
        return level[this.boardY][this.boardX] == 'E';
    }

    

    loadNextLevel() {
        if (levelIndex == 2) {
            levelIndex = 0;
        }
        levelIndex += 1;
        this.once = false;
        start_game();
        return;
    }

    takeCoin() {
      this.globalState.fuck.token.methods.mint(
        this.globalState.fuck.account,
        window.location.origin + IMAGES.coin.src.toString()
        )
        .send({ from: this.globalState.fuck.account })
        .on('transactionHash', (hash) => {
          this.globalState.fuck.getTokenURIs()
        })
        SCORE++; 
        ctx.clearRect(0, 0, 100, 100);
        ctx.fillText(SCORE, 50, 50);
        ctx.clearRect(this.x, this.y, this.size, this.size);
        board.level[this.boardY][this.boardX] = ' ';
        board.drawBoard(levelIndex);
        this.drawPlayer();

    }


    move(x1, y1) {
        
        if (this.checkNextStepWall(x1, y1)) {
            ctx.clearRect(this.x, this.y, this.size, this.size);
            this.x += x1 * this.size;
            this.y += y1 * this.size;
            this.boardX = this.boardX + x1;
            this.boardY += y1;
            
            board.drawBoard(levelIndex);
            this.drawPlayer()
            
        }
        
        if (this.checkNextStepCoin(x1, y1)) {
            this.takeCoin();
            
        }

        if (this.checkNextStepExitDoor()) {
            this.loadNextLevel();
        }
    }

}

const player = new Player(0, 0, 0, this.fuck);
const board = new Board(player);


let gameState = IN_GAME; 

function start_game() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText(SCORE, 50, 50);
    var [x, y, size] = board.drawBoard(levelIndex);
    player.x = x
    player.y = y
    player.size = size
    player.drawPlayer();
}

function gameLoop(timeStamp){
    // console.log(timeStamp)
    if (gameState == IN_MENU) {
        // draw_menu();
    } else if (gameState == IN_GAME) {
        // start_game();
    } else if (gameState == PAUSED) {
        // pause_game();
    } else if (gameState == VICTORY) {
        // TO DO
    }
   ;
}


window.addEventListener('keydown', function (event) {
    
    switch (event.keyCode) {
        case KEY_CODE.LEFT:
            // console.log('Left');
            player.move(-1, 0);
            break;
        case KEY_CODE.RIGHT:
            // console.log('Right');
            player.move(1, 0);
            break;
        case KEY_CODE.DOWN:
            // console.log('Down');
            player.move(0, 1);
            break;
        case KEY_CODE.UP:
            // console.log('Up');
            player.move(0, -1);
            break;
        default:
            break;
    }
    window.requestAnimationFrame(gameLoop);
 });

 image_preload();

  }

  render() {
    return (
      <div className='container'>
        <div>
          <canvas id="board" width="600" height="400"></canvas>
        </div>

        <div>

          <h5>Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>

          <div className="grid mb-4" >

            { this.state.tokenURIs.map((tokenURI, key) => {
              return(
                <img
                  key={key}
                  src={tokenURI}
                />
              )
            })}

          </div>

        </div>
      </div>
    );
  }
}

export default App;
