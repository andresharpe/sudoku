/// ./www/src/SudokuGrid.js

import React from 'react';
import SudokuCell from './SudokuCell.js';

class SudokuGrid extends React.Component {

    renderCell(y,x) {
        const game = this.props.game.state;
        const gridwidth = game.gridwidth;
        const blocksize = game.blocksize;
        const cell = y*gridwidth+x;
        const isGiven = game.given[cell] > 0;
        const value = game.puzzle[cell];
        const solution = game.solution[cell];
        const selectedValue = game.puzzle[game.selected];

        let isCompleted = value > 0;
        let strValue = value > 0 ? String(value) : '';
        let isError = !isGiven && isCompleted && (value !== solution);
        if ( game.isGamePaused ){
            const strMap = "Paused...";
            const cells = game.cells;
            const padding = (cells-strMap.length)/2;
            strValue = strMap.padStart(padding+strMap.length).padEnd(cells).substr(cell,1);
            isCompleted = true;
            isError = true;
        }

        const props = {
            id: cell,
            blocksize: blocksize,
            row: y,
            column: x,
            block: Math.floor(x/blocksize)+blocksize*Math.floor(y/blocksize),
            value: strValue,
            isGiven: isGiven,
            userMarkup: game.userMarkup[cell],
            isCompleted: isCompleted,
            isError: isError,
            isSelected: game.selected === cell,
            gridSelectedValue: selectedValue,
            isGameOver: game.isGameOver,
            isGameStarting: game.isGameStarting,
            isCaptureMode: game.isCaptureMode
        }
        return ( <SudokuCell {...props} key={cell}/> )
    }

    renderRow(y) {
        const i = this.props.game.state.gridwidth;
        let row =[];
        for( let x = 0; x < i; x++ ) {
            row.push( this.renderCell(y,x) );
        }
        return ( <tr className="sudoku-row" key={y}>{row}</tr> );
    }

    renderGrid() {
        const i = this.props.game.state.gridwidth;
        let board = [];
        for (let y = 0; y < i; y++ ){
            board.push(this.renderRow(y))
        }
        return ( 
            <table className="sudoku-grid">
                <tbody>{board}</tbody>
            </table> 
        );
    }

    render() {
        return (
            <div>
                {this.renderGrid()}
            </div>
        )
    }
}

export default SudokuGrid;
