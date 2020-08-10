/// ./www/src/SudokuMarkup.js

import React from 'react';

import Badge from 'react-bootstrap/Badge'

class SudokuMarkup extends React.Component {

    isBitSet(n, bitmap) {
        const mask = 1 << n; // zero based
        return (bitmap & mask) === mask;
    }

    renderMarkupCell(y,x) {
        const s = this.props.blocksize;
        const n = y*s+x;
        const mask = this.props.userMarkup;
        const isSet = this.isBitSet(n,mask);
        const val = isSet ? String(n+1) : "\u00a0";
        const highlight = String(this.props.gridSelectedValue) === val;
        return ( 
            <td key={n}>
                {
                    (highlight) ? <Badge variant="warning">{val}</Badge> : (val) 
                } 
            </td> 
        )
    }

    renderMarkupRows(y) {
        const s = this.props.blocksize;
        let row =[];
        for( let x = 0; x < s; x++ ) {
            row.push( this.renderMarkupCell(y,x) );
        }
        return ( <tr className="sudoku-cell-markup-row" key={y}>{row}</tr> );
    }

    renderMarkup() {
        const s = this.props.blocksize;
        let markup = [];
        for( let y = 0; y < s; y++ ) {
            markup.push(this.renderMarkupRows(y))
        }
        return ( 
            <table className="sudoku-cell-markup">
                <tbody>{markup}</tbody>
            </table> 
        );
    }

    render() {
        return ( <div>{this.renderMarkup()}</div> )
    }
}

export default SudokuMarkup;
