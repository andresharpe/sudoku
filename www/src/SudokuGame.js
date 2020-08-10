/// ./www/src/SudokuGame.js

import { memory } from '../../pkg/lib_bg.wasm';
import { Sudoku } from '../../pkg';

import React from 'react';
import SudokuGrid from './SudokuGrid.js';
import SudokuMenu from './SudokuMenu.js';
import SudokuNumberpad from './SudokuNumberpad.js';
import SudokuTimer from './SudokuTimer.js';
import SudokuAnimation from './SudokuAnimation.js';
    
class SudokuGame extends React.Component {
    constructor(props) {
        super(props);
        
        const wasm_sudoku = Sudoku.new();
        const gridwidth = wasm_sudoku.get_width();
        const cells = gridwidth*gridwidth;

        wasm_sudoku.generate();
        const given = new Uint32Array(memory.buffer, wasm_sudoku.get_given(), cells);
        const puzzle = new Uint32Array(memory.buffer, wasm_sudoku.get_puzzle(), cells);
        const solution = new Uint32Array(memory.buffer, wasm_sudoku.get_solution(), cells);
        const markup = new Uint32Array(memory.buffer, wasm_sudoku.get_markup(), cells);
        const userMarkup = markup.slice().fill(0);
        
        this.state = {
            wasm_sudoku: wasm_sudoku,
            gridwidth: gridwidth,
            cells: cells,
            blocksize: Math.sqrt(gridwidth),
            selected: 0,
            given: given,
            puzzle: puzzle,
            puzzlePrevious: given.slice(),
            solution: solution,
            markup: markup,
            userMarkup: userMarkup,
            captureMode: false,
            gameStarted: true,
            gameStarting: true,
            gamePaused: false,
            gameOver: false
        } 
    }

    // Game state changes
    startGame() {
        this.doMarkup();
        let userMarkup = this.state.markup.slice().fill(0);
        let puzzlePrevious = this.state.given.slice();
        this.setState( {userMarkup, puzzlePrevious, gameStarted: true, gameStarting: true, gameOver: false} );
    }

    // Utility methods

    getYX() {
        let s = this.state.selected;
        let w = this.state.gridwidth;
        return [ Math.floor(s/w), s%w ]
    }

    getIndex(y,x) {
        return y*this.state.gridwidth+x;
    }

    isBitSet(n, bitmap) {
        const mask = 1 << n; // zero based
        return (bitmap & mask) === mask;
    };

    // Attach event handlers for user input

    componentDidMount() {
        window.addEventListener("click", this.handleMouseClick.bind(this));
        window.addEventListener("paste", this.handleClipboardPaste.bind(this));
        window.addEventListener("keydown", this.handleKeyPress.bind(this));
    }

    // Handle touch/mouse input

    handleMouseClick(event){
        event = event || window.event;
        const target = event.target || event.srcElement;
        const el = this.findAncestorElement( target, 'sudoku-cell' )
        if( el !== null ) {
            this.setState( {selected: Number(el.id)} );
            if( this.state.gameStarting ){ this.setState( {gameStarting:false} ) };
        }
    }

    findAncestorElement(el, cls) {
        if( !el.classList.contains(cls) ) {
            while ((el = el.parentElement) && !el.classList.contains(cls));
        }
        return el;
    }

    // Handle clipboard paste

    handleClipboardPaste(event){
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        if( paste.length === this.state.cells ) {
            this.state.wasm_sudoku.initialize_with_string(paste);
                this.setState( {selected: this.state.selected} );
        }
        event.preventDefault();    
    }

    // Keyboard input

    handleKeyPress(event) {
        const key = event.key; 
        const isValidEntry = isFinite(key) && Number(key) > 0;
        const isDelete = key === '0' || key === 'Delete' || key === ' ' || key === '.';
        if( this.state.gameStarting ){ this.setState( {gameStarting:false} ) };
        if( this.state.captureMode && isValidEntry ) {
            this.setCapture( key );
        } else if( this.state.captureMode && isDelete ) {
            this.setCapture( 0 );
        } else if (isValidEntry && ( event.ctrlKey || event.metaKey || event.altKey )) {
            this.setUserMarkupValue( key );
        } else if(isValidEntry){
            this.setCellValue( key );
        } else if(isDelete) {
            this.clearCellValue();
        } else if(key === "ArrowRight") {
            this.moveRight();
        } else if(key === "ArrowLeft") {
            this.moveLeft();
        } else if(key === "ArrowUp") {
            this.moveUp();
        } else if(key === "ArrowDown") {
            this.moveDown();
        } else if( !this.state.captureMode && (key === "m" || key==="M") ) {
            this.copyMarkupToUserMarkup();
        } else if( !this.state.captureMode && (key === "c" || key==="C") ) {
            this.clearUserMarkupValues();
        }
    }

    // UX Actions

    moveRight() {
        const [y,x] = this.getYX();
        const i = this.getIndex(y,  x >= this.state.gridwidth-1 ? 0 : x+1 );
        this.setState( {selected: i} );
    }

    moveLeft() {
        const [y,x] = this.getYX();
        const i = this.getIndex(y,  x <= 0 ? this.state.gridwidth-1 : x-1 );
        this.setState( {selected: i} );
    }

    moveDown() {
        const [y,x] = this.getYX();
        const i = this.getIndex( y >= this.state.gridwidth-1 ? 0 : y+1, x );
        this.setState( {selected: i} );
    }

    moveUp() {
        const [y,x] = this.getYX();
        const i = this.getIndex( y <= 0 ? this.state.gridwidth-1 : y-1, x );
        this.setState( {selected: i} );
    }

    setCellValue( value ){
        if( this.state.captureMode ) {
            this.setCapture( value );
        } else if( this.state.given[ this.state.selected ] === 0 ){
            let puzzle = this.state.puzzle;
            puzzle[ this.state.selected ] = Number(value);
            this.setState( {puzzle, gameOver: this.state.wasm_sudoku.is_solved() } );
            this.doMarkup();
        }
    }

    clearCellValue(){
        this.setCellValue( "0" );
        if( !this.state.captureMode && this.state.userMarkup[ this.state.selected ] !== 0 ){
            let newUserMarkup = this.state.userMarkup;
            newUserMarkup[ this.state.selected ] = 0;
            this.setState( {userMarkup: newUserMarkup} );   
        }
    }

    setCapture( value ){
        const given = this.state.given;
        const puzzle = this.state.puzzle;
        const selected = this.state.selected;
        given[ selected ] = puzzle[ selected ] = Number(value);
        this.setState( {
            puzzle, given, 
            gameOver: false, 
            selected: selected === this.state.cells-1 ? 0 : selected+1 
        } );
        this.doMarkup();
    }

    // Markup methods

    doMarkup() {
        this.state.wasm_sudoku.do_markup();
        this.updateUserMarkup();
    }

    updateUserMarkup() {
        const markup = this.state.markup;
        const cells = this.state.cells;
        let newUserMarkup = this.state.userMarkup;
        for( let c = 0; c < cells; c++ ) {
            newUserMarkup[ c ] &= markup[ c ];
        }
        this.setState( {userMarkup: newUserMarkup} );   
    }

    setUserMarkupValue( value ){
        const n = Number(value)-1;
        let newUserMarkup = this.state.userMarkup;
        if( this.isBitSet( n, newUserMarkup[ this.state.selected ] ) ){
            newUserMarkup[ this.state.selected ] &= ~(1 << n);
        } else {
            newUserMarkup[ this.state.selected ] |= (1 << n);
        }
        this.setState( {userMarkup: newUserMarkup} );   
    }

    copyMarkupToUserMarkup() {
        this.setState( {userMarkup: [...this.state.markup],gameStarting:false} );
    }

    clearUserMarkupValues() {
        let newUserMarkup = [...this.state.markup];
        newUserMarkup.fill(0);
        this.setState( {userMarkup: newUserMarkup} );
    }

    // Menu actions

    handleNewClick() {
        this.state.wasm_sudoku.generate();
        this.startGame();
    }

    handleSolveClick() {
        if( !this.state.gameOver ){
            this.state.wasm_sudoku.reset();
            this.state.wasm_sudoku.solve(1);
            this.setState( {gameOver:true,gameStarting:false} );
        }
    }

    handleMarkupClick() {
        this.copyMarkupToUserMarkup();
    }

    handleRestartClick() {
        this.state.wasm_sudoku.reset();
        this.startGame();
    }

    handleCaptureClick() {
        const captureMode = !this.state.captureMode;
        if( captureMode ){
            this.state.wasm_sudoku.initialize_with_string( ".".repeat( this.state.cells ) );
            let userMarkup = this.state.markup.slice().fill(0);
            this.setState( {userMarkup: userMarkup, selected: 0, gameStarted: true, gameOver: false, captureMode: captureMode} );
        } else {
            this.setState( {gameStarted: true, gameOver: false, captureMode: captureMode} );
        }
    }

    // render the puzzle

    render() {
        return (
            <div>
                <div>
                    <SudokuAnimation game={this} />
                </div>

                <div className="d-flex justify-content-center">
                    <SudokuMenu game={this} />
                </div>
                &nbsp;

                <div className="d-flex justify-content-center">
                    <SudokuGrid game={this} />
                </div>
                &nbsp;

                <div className="d-flex justify-content-center">
                    <SudokuTimer game={this} />
                </div>
                &nbsp;

                <div className="d-flex justify-content-center">
                    <SudokuNumberpad game={this} />
                </div>
                &nbsp;

                <div className="d-flex justify-content-center">
                    <small>Made with Rust and React</small>
                </div>
                &nbsp;
                
                <div className="d-flex justify-content-center">
                    <small><pre>{this.state.wasm_sudoku.to_string()}</pre></small>
                </div>
            </div>
        )
    }
}
  
export default SudokuGame;

