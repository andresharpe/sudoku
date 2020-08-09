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
                    + (this.props.selected && (!this.props.gameOver || this.props.captureMode) ? " sudoku-cell-selected" : "" )
                    + (this.props.given ? " sudoku-cell-given" : "" )
                    + (this.props.error ? " sudoku-cell-error" : "" )
                    + (this.props.given && this.props.gameOver ? " sudoku-cell-selected" : "" )
                }   
            >
                { 
                    (this.props.completed) 
                    ?(
                        this.props.value
                    ):(
                        ( (this.props.userMarkup & b_111111111) > 0 ) ?
                            <SudokuMarkup {...this.props} />
                        : null
                    )
                }
            </td>
        )
    }
}

export default SudokuCell;
