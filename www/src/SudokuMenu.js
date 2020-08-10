/// ./www/src/SudokuMenu.js

import React from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

class SudokuMenu extends React.Component {
    
    render() {
        const game = this.props.game;
        const isCaptureMode = game.state.isCaptureMode;
        const captureButtonText = isCaptureMode ? 'Done' : 'Capture';
        return (
            <div>
            <ButtonGroup aria-label="Sudoku Menu" size="sm">
                <Button id="new" variant="primary" onClick={() => game.handleNewClick()} disabled={isCaptureMode}>New</Button>
                <Button id="solve"  variant="primary" onClick={() => game.handleSolveClick()} disabled={isCaptureMode}>Solve</Button>
                <Button id="markup" variant="primary" onClick={() => game.handleMarkupClick()}>Markup</Button>
                <Button id="restart" variant="primary" onClick={() => game.handleRestartClick()} disabled={isCaptureMode}>Restart</Button>
                <Button id="capture" variant="primary" onClick={() => game.handleCaptureClick()}>{captureButtonText}</Button>
            </ButtonGroup>
        </div>
        )
    }
}

export default SudokuMenu;
