/// ./www/src/SudokuCell.js

import React from 'react';
import SudokuMarkup from './SudokuMarkup.js';

class SudokuCell extends React.Component {
    render() {
        const b_111111111 = 511;
        return (
            <td
                id={this.props.id}
                row={this.props.row}
                column={this.props.column}
                block={this.props.block}
                className={
                    "sudoku-cell" 
                    + (this.props.isSelected && (!this.props.isGameOver || this.props.isCaptureMode) ? " sudoku-cell-selected" : "" )
                    + (this.props.isGiven ? " sudoku-cell-given" : "" )
                    + (this.props.isError ? " sudoku-cell-error" : "" )
                    + (this.props.isGiven && this.props.isGameOver ? " sudoku-cell-selected" : "" )
                    + (this.props.isGiven && this.props.isGameStarting ? " sudoku-startgame" : "" )
                }   
            >
                { 
                    (this.props.isCompleted) 
                    ?(
                        this.props.value
                    ):(
                        ( (this.props.userMarkup & b_111111111) > 0 ) ?
                            <SudokuMarkup 
                                blocksize={this.props.blocksize} 
                                userMarkup={this.props.userMarkup}
                                gridSelectedValue={this.props.gridSelectedValue}
                            />
                        : null
                    )
                }
            </td>
        )
    }
}

export default SudokuCell;
