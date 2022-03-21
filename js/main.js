let game = {
        cs: 85, // cell size
        rows: 8,
        cols: 8,
        white: 2,
        black: 2,
        total: 4,
        loading: false,
        tries: 0,
        cpu: 0
    };
(function ($) {
    let gs = $('#game'),
        d = $('#data'),
        cp =$('#current-player'),
        o = $('#overlay'),
        s = $('#settings');

    gs
        .on('click', '.cell', function (e) {
            e.preventDefault();
            if(game.loading) return;
            let c = $(this);
            if(c.hasClass('valid-move')) {
                make_move(c);
            }
        })
        .on('contextmenu', '.cell', function (e) {
            e.preventDefault();
        });

    function init() {
        game.cpu = d.data('player2') === 'cpu';
        prepare();
        start();
    }

    function prepare() {
        let mw = $(window).outerWidth();
        mw = mw > 500 ? 500 : mw-10;
        game.cs = Math.floor(mw / game.cols);
        game.cs = game.cs > 100 ? 100 : game.cs;
    }

    function start() {
        game.key = generate();
        next_board();
    }

    function next_board() {
        let np = cp.hasClass('piece--white') ? 'piece--black' : 'piece--white';
        cp.removeClass('piece--white').removeClass('piece--black').addClass(np);
        draw_board();
        draw_valid_moves();
        game.total = calc_score();

        if(game.total === (game.rows * game.cols)) {
            game_over();
            return false;
        }
        else if(gs.find('.valid-move').length == 0) {
            if( game.tries > 0 ) {
                game_over(false);
                return false;
            }
            else {
                setTimeout(function() {
                    if(!alert('No valid moves. Skip turn.')) {
                        game.tries++;
                        next_board();
                    }
                }, 100);
                return false;
            }
        }

        if(np === 'piece--white' && game.cpu) {
            go_cpu();
        } else {
            game.loading = false;
        }
    }

    function move(elem, row, col) {
        elem.css({
            top: row * game.cs + 'px',
            left: col * game.cs + 'px'
        });
    }

    function make_move(c) {
        game.loading = true;
        game.tries = 0;
        put(c);
        check_reverse_cell(c);
        setTimeout(function() {
            next_board();
        }, 400);
    }

    function put(c) {
        let cn = cp.hasClass('piece--white') ? 'piece--white' : 'piece--black',
            cw = c.find('.piece-wrapper'),
            p = $('<div class="piece"></div>'),
            id = c.attr('id').split('-'),
            x = parseInt(id[0]),
            y = parseInt(id[1]);
            p.addClass(cn);
            p.appendTo(cw);
            cw.appendTo(c);
            game.key[x][y] = cp.hasClass('piece--white') ? 1 : 2;
            c.removeClass('valid-move');
    }

    function seek_reverse(x, y, xp, yp, val) {
        x = x + xp;
        y = y + yp;
        if(x < 0 || x === game.cols) return false;
        if(y < 0 || y === game.rows) return false;
        if(game.key[x][y] === '') return false;
        if(game.key[x][y] === val) {
            game.key[x][y] = val;
            reverse($('#'+ x + '-' + y).find('.piece'));
            game.key[x][y] = cp.hasClass('piece--white') ? 1 : 2;
            return seek_reverse(x,y,xp,yp,val);
        }
        return false;
    }

    function check_reverse_cell(c) {
        let cn = cp.hasClass('piece--white') ? 2 : 1,
            sn = cp.hasClass('piece--white') ? 1 : 2,
            id = c.attr('id').split('-'),
            x = parseInt(id[0]),
            y = parseInt(id[1]);
        if(seek(x,y,-1,0,sn)) seek_reverse(x,y,-1,0,cn);
        if(seek(x,y,1,0,sn)) seek_reverse(x,y,1,0,cn);
        if(seek(x,y,0,-1,sn)) seek_reverse(x,y,0,-1,cn);
        if(seek(x,y,0,1,sn)) seek_reverse(x,y,0,1,cn);
        if(seek(x,y,-1,-1,sn)) seek_reverse(x,y,-1,-1,cn);
        if(seek(x,y,-1,1,sn)) seek_reverse(x,y,-1,1,cn);
        if(seek(x,y,1,-1,sn)) seek_reverse(x,y,1,-1,cn);
        if(seek(x,y,1,1,sn)) seek_reverse(x,y,1,1,cn);
    }

    function reverse(p) {
        let c = p.hasClass('piece--white') ? 'piece--black' : 'piece--white';
        p.addClass('piece-flip');
        setTimeout(function() {
            p.removeClass('piece--white').removeClass('piece--black').removeClass('piece-flip').addClass(c);
        }, 200);
    }

    function calc_score() {
        let w = b = 0;
        for(let i=0; i<game.rows ;i++) {
            for(let j=0; j<game.cols ;j++) {
                if(game.key[i][j]) {
                    if(game.key[i][j] === 1) w++;
                    else if(game.key[i][j] === 2) b++;
                }
            }
        }
        game.white = w;
        game.black = b;
        $('#white_score').text(w);
        $('#black_score').text(b);
        return w+b;
    }

    function game_over(full=true) {
        let msg = '',
            winner = game.white > game.black ? 'White Wins!' : 'Black Wins!';
        winner = game.white === game.black ? 'A Tie!' : winner;
        if(full) {
            msg = 'Game Over! ' + winner;
        } else {
            msg = 'No valid moves for both players! ' + winner;
        }
        setTimeout(function() {
            alert(msg);
        }, 100);
    }

    function generate() {
        let data = [];

        for(let i=0; i<game.cols ;i++) {
            let row = [];
            for(let j=0; j<game.rows ;j++) {
                row.push('');
            }
            data.push(row);
        }

        data[3][3] = 1;
        data[3][4] = 2;
        data[4][3] = 2;
        data[4][4] = 1;
        return data;
    }

    function draw_board() {
        gs.removeClass('ready');
        gs.html('');
        gs.css({
            width: game.cols * game.cs + 4 + 'px',
            height: game.rows * game.cs + 4 + 'px'
        });
        d.css({
            width: game.cols * game.cs + 4 + 'px',
        });
        s.css({
            width: game.cols * game.cs + 4 + 'px',
        });

        for(let i=0; i<game.rows ;i++) {
            for(let j=0; j<game.cols ;j++) {
                let elem = $('<div id="'+ i +'-'+ j +'" class="cell" style="' +
                    'width:'+ game.cs +'px;' +
                    'height:'+ game.cs +'px;' +
                    '"></div>'),
                    cw = $('<div class="piece-wrapper"></div>');

                if(game.key[i][j]) {
                    let c = $('<div class="piece"></div>');
                    if(game.key[i][j] === 1) c.addClass('piece--white');
                    else if(game.key[i][j] === 2) c.addClass('piece--black');
                    c.appendTo(cw);
                }
                cw.appendTo(elem);
                elem.appendTo(gs);
                move(elem, i, j);
            }
        }

        gs.addClass('ready');
    }

    function draw_valid_moves() {
        let cn = cp.hasClass('piece--white') ? 'piece--black' : 'piece--white',
            cnum = cn === 'piece--white' ? 1 : 2;
        for(let i=0; i<game.rows ;i++) {
            for(let j=0; j<game.cols ;j++) {
                if(game.key[i][j] === cnum) {
                    check_valid_cell(i, j, 'up', cnum);
                    check_valid_cell(i, j, 'down', cnum);
                    check_valid_cell(i, j, 'left', cnum);
                    check_valid_cell(i, j, 'right', cnum);
                    check_valid_cell(i, j, 'up-left', cnum);
                    check_valid_cell(i, j, 'up-right', cnum);
                    check_valid_cell(i, j, 'down-left', cnum);
                    check_valid_cell(i, j, 'down-right', cnum);
                }
            }
        }
    }

    function seek(x, y, xp, yp, val) {
        x = x + xp;
        y = y + yp;
        if(x < 0 || x === game.cols) return false;
        if(y < 0 || y === game.rows) return false;
        if(game.key[x][y] === '') return false;
        if(game.key[x][y] === val) return true;
        return seek(x, y, xp, yp, val);
    }

    function check_valid_cell(row, col, direction, val) {
        let sv = val === 1 ? 2 : 1;
        switch(direction) {
            case 'up':
                if(row > 0) {
                    if(!game.key[row-1][col]) {
                        if(seek(row, col, 1, 0, sv)) {
                            $('#'+ (row-1) +'-'+ col).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'down':
                if(row < (game.rows-1)) {
                    if(!game.key[row+1][col]) {
                        if(seek(row, col, -1, 0, sv)) {
                            $('#'+ (row+1) +'-'+ col).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'left':
                if(col > 0) {
                    if(!game.key[row][col-1]) {
                        if(seek(row, col, 0, 1, sv)) {
                            $('#' + row + '-' + (col - 1)).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'right':
                if(col < (game.cols-1)) {
                    if(!game.key[row][col+1]) {
                        if(seek(row, col, 0, -1, sv)) {
                            $('#' + row + '-' + (col + 1)).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'up-left':
                if(row > 0 && col > 0) {
                    if(!game.key[row-1][col-1]) {
                        if(seek(row, col, 1, 1, sv)) {
                            $('#' + (row - 1) + '-' + (col - 1)).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'up-right':
                if(row > 0 && col < (game.cols-1)) {
                    if(!game.key[row-1][col+1]) {
                        if(seek(row, col, 1, -1, sv)) {
                            $('#' + (row - 1) + '-' + (col + 1)).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'down-left':
                if(row < (game.rows-1) && col > 0) {
                    console.log(row, col);
                    if(!game.key[row+1][col-1]) {
                        console.log(game.key[row+1][col-1]);
                        if(seek(row, col, -1, 1, sv)) {
                            $('#' + (row + 1) + '-' + (col - 1)).addClass('valid-move');
                        }
                    }
                }
                break;
            case 'down-right':
                if(row < (game.rows-1) && col < (game.cols-1)) {
                    if(!game.key[row+1][col+1]) {
                        if(seek(row, col, -1, -1, sv)) {
                            $('#' + (row + 1) + '-' + (col + 1)).addClass('valid-move');
                        }
                    }
                }
                break;
        }
    }

    function go_cpu() {
        o.addClass('show');
        setTimeout(function() {
            o.removeClass('show');
            make_move(gs.find('.valid-move').eq(Math.floor(Math.random() * gs.find('.valid-move').length)));
        }, (Math.floor(Math.random() * 2000) + 1000));
    }
    init();
})(jQuery);
