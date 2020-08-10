/// ./www/src/SudokuNumberpad.js

import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';

class SudokuNumberpad extends React.Component {

    calcKeypadState() {
        const game = this.props.game;
        const gridwidth = game.state.gridwidth;
        const cells = game.state.cells;
        const puzzle = game.state.puzzle;
        const solution = game.state.solution;
        let keypadState = new Array(gridwidth).fill(0);
        for( let i = 0; i < cells; i++ ){
            (solution[i] === puzzle[i]) ? keypadState[puzzle[i]-1]++ : null;
        }
        return keypadState;
    }

    renderKeypad() {
        const game = this.props.game;
        const gridwidth = game.state.gridwidth;
        const numbers = Array.from({length:gridwidth},(_,i)=>i+1);
        const keypadState = this.calcKeypadState();
        let buttons = numbers.map( function(v) { 
            return (
                <Button 
                    key={'keypad_'+v} id={'keypad_'+v} 
                    variant="outline-primary" className="btn-circle" 
                    onClick={() => game.setCellValue(v)} 
                    disabled={keypadState[v-1]===gridwidth}
                >{v}</Button>
            );
        });
        buttons.push(
            <Button key="keypad_0" id="keypad_0" variant="outline-primary" className="btn-circle" onClick={() => game.clearCellValue()}>␡</Button>
        );
        return (<div>{buttons}</div>);
    }

    renderMarkupPad() {
        const game = this.props.game;
        const gridwidth = game.state.gridwidth;
        const numbers = Array.from({length:gridwidth},(_,i)=>i+1);
        let buttons = numbers.map( function(v) { 
            return (
                <Button 
                    key={'markuppad_'+v} id={'markuppad_'+v} 
                    variant="outline-success" className="btn-circle" 
                    onClick={() => game.setUserMarkupValue(v)} 
                >{v}</Button>
            );
        });
        buttons.push(
            <Button key="markuppad_0" id="markuppad_0" variant="outline-success" className="btn-circle" onClick={() => game.clearUserMarkupValues()}>␡</Button>
        )
        return (<div>{buttons}</div>);
    }

    render() {
        const game = this.props.game;
        return (
        <div>
            <div className="d-flex justify-content-center text-primary">Keypad</div>
            <Row>
                {this.renderKeypad()}            
            </Row>
            &nbsp;
            <div className="d-flex justify-content-center text-success">Markup</div>
            <Row>
                {this.renderMarkupPad()}
            </Row>
        </div>
        )
    }
}

export default SudokuNumberpad;
