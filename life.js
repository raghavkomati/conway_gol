function $(selector, container) {
    return (container || document).getElementById(selector);
}

(function() {
    var _ = self.Life = function(seed) {
        this.seed = seed;
        this.height = seed.length;
        this.width = seed[0].length;
        this.prevBoard = [];
        this.board = clone2DArray(seed);
    };


    _.prototype = {
        next: function() {
            this.prevBoard = clone2DArray(this.board);

            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var neighbors = this.aliveNeighbors(this.prevBoard, x, y);
                    // console.log(neighbors);
                    if (this.prevBoard[y][x] && (neighbors < 2 || neighbors > 3)) {
                        this.board[y][x] = 0;
                    } else if ((this.prevBoard[y][x] && neighbors > 1 && neighbors < 4) || (!this.prevBoard[y][x] && neighbors === 3)) {
                        this.board[y][x] = 1;
                    }
                }
            }

        },
        aliveNeighbors: function(a, x, y) {
            var around = [
                (a[y-1] && a[y-1][x-1]), (a[y-1] && a[y-1][x]), (a[y-1] && a[y-1][x+1]),
                (a[y] && a[y][x-1]), (a[y] && a[y][x+1]),
                (a[y+1] && a[y+1][x-1]), (a[y+1] && a[y+1][x]), (a[y+1] && a[y+1][x+1])
            ];
            return around.reduce(function(iAround, iCurrent){
                iAround += (+!!iCurrent);
                return iAround;
            }, 0);
        },
        toString: function() {
            return this.board.map(function(row) { return row.join(" "); }).join("\n");
        }
    }

    function clone2DArray(array) {
        return array.slice().map(function(row) { return row.slice(); });
    }
})();

var game = new Life([
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
]);

console.log(game + '');

game.next();

console.log(game + '');

game.next();

console.log(game + '');


(function() {
    var _ = self.LifeView = function(table, size) {
        this.size = size;
        this.grid = table;

        this.createGrid();
    }

    _.prototype = {
        createGrid: function() {
            var fragment = document.createDocumentFragment();
            this.grid.innerHTML = "";
            this.checkBoxes = [];

            for (var y = 0; y < this.size; y++) {
                var row = document.createElement('tr');
                this.checkBoxes[y] = [];

                for (var x = 0; x < this.size; x++) {
                    var cell = document.createElement('td');
                    var checkBox = document.createElement('input');
                    checkBox.type = 'checkbox';
                    this.checkBoxes[y][x] = checkBox;
                    checkBox.coords = [y, x];
                    cell.appendChild(checkBox);
                    row.appendChild(cell)
                }
                fragment.appendChild(row)
            }

            this.grid.addEventListener('change', (evt) => {
                if (evt.target.nodeName.toLowerCase() === 'input') {
                    this.gameStatus = "pause";
                    document.getElementById('play-btn').classList.add("fa-play");
                    document.getElementById('play-btn').classList.remove("fa-pause");            
                }
            });

            this.grid.addEventListener('keyup', (evt) => {
                var cb = evt.target;
                if (checkBox.nodeName.toLowerCase() === 'input') {
                    var y = cb.coords[0];
                    var x = cb.coords[1];
                    // console.log(evt.keyCode);
                    switch(evt.keyCode) {
                        case 37:
                            if (x > 0) {
                                this.checkBoxes[y][x-1].focus();
                            } else {
                                this.checkBoxes[y][this.size - 1].focus();
                            }
                            break;
                        case 38:
                            if (y > 0) {
                                this.checkBoxes[y-1][x].focus();
                            } else {
                                this.checkBoxes[this.size - 1][x].focus();
                            }
                            break;
                        case 39:
                            if (x < (this.size - 1)) {
                                this.checkBoxes[y][x+1].focus();
                            } else {
                                this.checkBoxes[y][0].focus();
                            }
                            break;
                        case 40:
                            if (y < (this.size - 1)) {
                                this.checkBoxes[y+1][x].focus();
                            } else {
                                this.checkBoxes[0][x].focus();
                            }
                            break;
                        default:
                    }
                }
            });
            this.grid.appendChild(fragment);
        },

        get boardArray() {
            return this.checkBoxes.map((row) =>{
                return row.map((checkBox) => {
                    return +!!checkBox.checked;
                })
            })
        },

        play() {
            if (!this.game || this.gameStatus !== 'on') {
                this.game = new Life(this.boardArray);
                if (!this.gameTimeout) {
                    this.gameTimeout = setInterval(() => {
                        if (this.gameStatus === 'on') {
                            this.next();
                        } else if (this.gameStatus === 'pause') {
                            return;
                        } else if (this.gameStatus === 'off') {
                            clearInterval(this.gameTimeout);
                        }
                    }, 1500);    
                }
            }
        },

        next() {
            this.game.next();

            var board = this.game.board;

            for(var y=0; y < this.size; y++) {
                for(var x = 0; x < this.size; x++) {
                    this.checkBoxes[y][x].checked = !!board[y][x];
                }
            }
        },

        reset() {
            for(var y=0; y < this.size; y++) {
                for(var x = 0; x < this.size; x++) {
                    this.checkBoxes[y][x].checked = false;
                }
            }
        }
    }
})();

var lifeView = new LifeView(document.getElementById('grid'), 12);

$('play-btn').addEventListener('click', function(e) {
    if (lifeView.gameStatus !== "on") {
        lifeView.play();
        lifeView.gameStatus = "on";
        document.getElementById('play-btn').classList.remove("fa-play");
        document.getElementById('play-btn').classList.add("fa-pause");
    } else if (lifeView.gameStatus === "on") {
        lifeView.gameStatus = "pause";
        document.getElementById('play-btn').classList.add("fa-play");
        document.getElementById('play-btn').classList.remove("fa-pause");
    }
    document.getElementById('stop-btn').disabled = false;
});

// $('pause-btn').addEventListener('click', function() {
//     lifeView.gameStatus = "pause";
// });

$('stop-btn').addEventListener('click', function(e) {
    lifeView.gameStatus = "off";
    e.srcElement.disabled = true;
    lifeView.reset();
    document.getElementById('play-btn').classList.remove("fa-pause");
    document.getElementById('play-btn').classList.remove("fa-play");
    document.getElementById('play-btn').classList.add("fa-play");
});
