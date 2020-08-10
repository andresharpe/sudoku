/// ./www/src/SudokuCelebration.js

import React from 'react';
import UIfx from 'uifx'
import soundSuccessMp3 from "./media/Success.mp3"
import soundSmallSuccessMp3 from "./media/SmallSuccess.mp3"


class SudokuAnimation extends React.Component {
    constructor(props) {
        super(props);
        const soundSuccess = new UIfx(soundSuccessMp3)
        const soundSmallSuccess = new UIfx(soundSmallSuccessMp3)
        this.state = {
            soundSuccess: soundSuccess,
            soundSmallSuccess: soundSmallSuccess
        } 
    }

       // solved animations
    componentDidUpdate() {
        this.processAnimations();
    }

    processAnimations() {
        const game = this.props.game;
        if (!game.state.captureMode) {

            // solved animations
            const elements = document.querySelectorAll('.sudoku-cell-solved');
            if( elements.length > 0 ) {
                elements.forEach( function(e) { 
                    e.addEventListener("animationend", this.removeSolvedAnimation, false); 
                }.bind( this ) ) 
            } else {
                const animationSelector = this.calculateAnimations();
                if ( animationSelector.length > 0 ){
                    const elements = document.querySelectorAll(animationSelector);
                    elements.forEach( function(e) { e.classList.add('sudoku-cell-solved') } );
                }
            }
        }
    }

    removeSolvedAnimation(e) {
        e.target.classList.remove('sudoku-cell-solved');
    }

    calculateAnimations() {
        const game = this.props.game;
        const solution = game.state.solution;
        const puzzle = game.state.puzzle.slice();
        let puzzlePrevious = game.state.puzzlePrevious;

        let identical = true;
        for( let i = 0; i < puzzle.length ; i++ ){
            if( puzzle[i] !== puzzlePrevious[i] ) {
                identical = false;
                break;
            }
        }
        if (identical) {
            return "";
        }

        if (game.state.gameOver) {
            // Animate entire grid
            puzzlePrevious = game.state.given.slice();
        }
       
        let animationSelector = "";
        let delimeter = "";
        const sections = [
            [ "row", [ 
                [ 0, 1, 2, 3, 4, 5, 6, 7, 8],
                [ 9,10,11,12,13,14,15,16,17],
                [18,19,20,21,22,23,24,25,26],
                [27,28,29,30,31,32,33,34,35],
                [36,37,38,39,40,41,42,43,44],
                [45,46,47,48,49,50,51,52,53],
                [54,55,56,57,58,59,60,61,62],
                [63,64,65,66,67,68,69,70,71],
                [72,73,74,75,76,77,78,79,80] 
            ]],
            [ "column", [ 
                [ 0, 9,18,27,36,45,54,63,72],
                [ 1,10,19,28,37,46,55,64,73],
                [ 2,11,20,29,38,47,56,65,74],
                [ 3,12,21,30,39,48,57,66,75],
                [ 4,13,22,31,40,49,58,67,76],
                [ 5,14,23,32,41,50,59,68,77],
                [ 6,15,24,33,42,51,60,69,78],
                [ 7,16,25,34,43,52,61,70,79],
                [ 8,17,26,35,44,53,62,71,80] 
            ]],
            [ "block", [ 
                [ 0, 1, 2, 9,10,11,18,19,20],
                [ 3, 4, 5,12,13,14,21,22,23],
                [ 6, 7, 8,15,16,17,24,25,26],
                [27,28,29,36,37,38,45,46,47],
                [30,31,32,39,40,41,48,49,50],
                [33,34,35,42,43,44,51,52,53],
                [54,55,56,63,64,65,72,73,74],
                [57,58,59,66,67,68,75,76,77],
                [60,61,62,69,70,71,78,79,80] 
            ]],
        ];

        for( let section = 0; section < sections.length; section++ ){
            const sectionName = sections[ section ][0];
            const groups = sections[ section ][1]
            for( let group = 0; group < groups.length; group++ ){
                let isCompleted = true;
                for( let cell = 0; cell < groups[ group ].length; cell++ ) {
                    const i = groups[ group ][cell];
                    if( puzzle[i] !== solution[i] ) {
                        isCompleted = false;
                        break;
                    }
                }
                if (isCompleted){
                    let wasCompleted = true;
                    for( let cell = 0; cell < groups[ group ].length; cell++ ) {
                        const i = groups[ group ][cell];
                        if( puzzlePrevious[i] !== solution[i] ){
                            wasCompleted = false;
                            break;
                        }
                    }
                    if ( !wasCompleted && isCompleted ) {
                        animationSelector += (delimeter+'['+sectionName+'="'+group+'"]');
                        delimeter = ',';
                    }
                }
    
            }
        }
        game.setState( {puzzlePrevious: puzzle } )

        // sound FX
        if( animationSelector !== "" ) {
            if( game.state.gameOver ){
                this.state.soundSuccess.play();
            } else {
                this.state.soundSmallSuccess.play(0.9);
            }
        }

        return animationSelector;
    }

    render() {
        const game = this.props.game;
        return (
            <div>
            { 
                (game.state.gameOver && !game.state.captureMode) ? (
                    <div className="fireworks">
                        <div className="before"></div>
                        <div className="after"></div>
                    </div>
                ) : (null)
            }
            </div>
        )
    }
} 

export default SudokuAnimation;