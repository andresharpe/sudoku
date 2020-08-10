/// ./www/src/App.js

import React from 'react';
import SudokuGame from './SudokuGame.js';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import './styles/App.scss';

class App extends React.Component {
  render() {
    return (
        <div className="App">
            <div>
                <Navbar bg="dark">
                  <Navbar.Brand href="#">
                    <img
                      src={require("./media/Ferris.svg")}
                      height="30" 
                      className="d-inline-block align-top" 
                      alt="Rust Sudoku Logo"
                    />
                    &nbsp;&nbsp;
                    Sudoku
                  </Navbar.Brand>
              </Navbar>
              &nbsp;
              <SudokuGame />
          </div>
        </div>
      );
  }
}

export default App;