/// ./www/src/SudokuTimer.js

import React from 'react';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';

class SudokuTimer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            milliSeconds: null,
            isTimerPaused: false,
            startTime: Date.now()
        } 
    }

    componentDidMount() {
        setInterval( () => this.tick(), 100 );
    }

    elapsedTime() {
        return (Date.now() - this.state.startTime);
    }

    pause() {
        if( !this.state.isTimerPaused ) {
            this.setState( { milliSeconds: this.elapsedTime(), isTimerPaused: true, startTime: null });
        }
    }

    continue() {
        if( this.state.isTimerPaused ) {
            const start = Date.now() - this.state.milliSeconds;
            this.setState( { milliSeconds: null, isTimerPaused: false, startTime: start });
        }
    }

    restart() {
        this.setState( { milliSeconds: null, isTimerPaused: false, startTime: Date.now() });
    }

    toggleGamePause(){
        const isGamePaused = !this.props.game.state.isGamePaused;
        isGamePaused ? this.pause() : this.continue();
        this.props.game.setState( {isGamePaused} );
    }
    
    tick() {
        if( this.props.game.state.isGameStarted ){
            this.restart();
            this.props.game.setState( {isGameStarted: false });
        } else if ( this.state.isTimerPaused ){
            // do nothing
        } else {
            if( this.props.game.state.isGameOver ) {
                this.pause();
            } else {
                this.setState( { milliSeconds: this.elapsedTime() } );
            }
        }
    }

    timeToString() {
        const seconds = ( this.state.isTimerPaused ? this.state.milliSeconds : this.elapsedTime() ) / 1000;
        const ss = (Math.floor( seconds ) % 60).toString().padStart(2,'0');
        const mm = (Math.floor( seconds / 60 ) % 60).toString().padStart(2,'0') ;
        const hh = (Math.floor( seconds / 3600 )).toString().padStart(2,'0');
        return (hh+":"+mm+":"+ss);
    }

    render() {
        return (
        <div>
            <Row className="justify-content-md-center">
                <Button variant="outline-info" size='sm' onClick={() => this.toggleGamePause() }>
                    {this.timeToString()}
                </Button>
            </Row>
        </div>
    )}
} 

export default SudokuTimer;