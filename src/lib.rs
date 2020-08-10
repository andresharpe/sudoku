/// ./src/lib.rs

use wasm_bindgen::prelude::*;

extern crate web_sys;
extern crate rand;

use rand::Rng;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Sudoku-ing starts here...

const GRID_BLOCK_WIDTH: usize = 3;
const GRID_WIDTH: usize = GRID_BLOCK_WIDTH * GRID_BLOCK_WIDTH;
const GRID_SIZE: usize = GRID_WIDTH * GRID_WIDTH;

// array of numbers [0..9] with respective bit position set
// resolved at compile time
const NUM_TO_BITMAP:[usize;GRID_WIDTH+1] = [0,1<<0,1<<1,1<<2,1<<3,1<<4,1<<5,1<<6,1<<7,1<<8];

#[wasm_bindgen]
pub struct Sudoku {
    given: [usize; GRID_SIZE],
    markup: [usize; GRID_SIZE],
    solution: [usize; GRID_SIZE],
    puzzle: [usize; GRID_SIZE],
    solution_count: usize,
    solution_limit: usize,
}

#[wasm_bindgen]
impl Sudoku {

    pub fn new() -> Sudoku {
        Sudoku {
            given: [0 ; GRID_SIZE],
            markup: [0 ; GRID_SIZE],
            solution: [0; GRID_SIZE],
            puzzle: [0; GRID_SIZE],
            solution_count: 0,
            solution_limit: 1,
        }
    }

    pub fn get_width(&self) -> u32 {
        GRID_WIDTH as u32
    }

    pub fn get_given(&self) -> *const [usize;GRID_SIZE] {
        &self.given
    }

    pub fn get_markup(&self) -> *const [usize;GRID_SIZE] {
        &self.markup
    }

    pub fn get_puzzle(&self) -> *const [usize;GRID_SIZE] {
        &self.puzzle
    }

    pub fn get_solution(&self) -> *const [usize;GRID_SIZE] {
        &self.solution
    }

    pub fn initialize_with_string( &mut self, str_given: String ) {
        let bytes = str_given.as_bytes();
        let mut a_given: [usize;GRID_SIZE] = [0;GRID_SIZE];
        if bytes.len() == GRID_SIZE {
            for (pos,&b) in bytes.iter().enumerate() {
                if (b >= b'1') && (b <= b'9') {
                    a_given[ pos ] = (b - 48) as usize 
                };
            }
            self.initialize_with_array( a_given );
        }
    }

    fn initialize_with_array( &mut self, a_given: [usize;GRID_SIZE] ) {
        self.given = a_given;
        self.puzzle = a_given;
        self.solve( 1 );
        self.puzzle = a_given;
        self.do_markup();
    }

    pub fn solve( &mut self, limit: usize) {
        self.solution_count = 0;
        self.solution_limit = limit;
        self.solve_lonerangers();
        self.solve_recursive();
    }
    
    fn solve_recursive( &mut self ) { 
        // find and solve a blank cell
        for pos in 0..GRID_SIZE {
            if self.puzzle[ pos ] == 0 {
                let valid_bits = self.valid_values_as_bits(pos);
                for value in 1..GRID_WIDTH+1 {
                    if ( valid_bits & NUM_TO_BITMAP[ value ] ) > 0 {
                        self.puzzle[ pos ] = value;
                        self.solve_recursive();  // recurse!
                        if self.solution_count == self.solution_limit { return; }
                        self.puzzle[ pos ] = 0;  // backtrack
                    }
                }
                return;
            }
        }
        // only reaches this point if all cells are solved
        self.solution = self.puzzle;
        self.solution_count += 1;  
        return;
    }

    fn valid_values_as_bits( &self, pos: usize ) -> usize {
            // find current row for cell at pos
            let y = pos / GRID_WIDTH;
            // find current column for cell at pos
            let x = pos % GRID_WIDTH;
            // find top left cell of block for cell at pos
            let topleft = ( y / GRID_BLOCK_WIDTH ) * GRID_BLOCK_WIDTH * GRID_WIDTH + ( x / GRID_BLOCK_WIDTH ) * GRID_BLOCK_WIDTH; 

            // Set all "invalid" bits to 0
            let mut invalid_values: usize = 0;
            // check each of 9 cells in current row, column and block 
            for n in 0..GRID_WIDTH {
                // set bit of invalid values for cell at pos to 1
                invalid_values = invalid_values
                    | NUM_TO_BITMAP[ self.puzzle[ n * GRID_WIDTH + x ] ]   // check column
                    | NUM_TO_BITMAP[ self.puzzle[ y * GRID_WIDTH + n ] ]  // check row
                    | NUM_TO_BITMAP[ self.puzzle[                        // check block
                        topleft + 
                        ( n % GRID_BLOCK_WIDTH ) * GRID_WIDTH + 
                        ( n / GRID_BLOCK_WIDTH  )
                    ] ]; 
            }
        // then flip all bits to convert "invalid" bits to 0, and "valid" bits to 1
        !invalid_values
    }

    pub fn do_markup( &mut self ) {
        for pos in 0..GRID_SIZE {
            if self.puzzle[ pos ] == 0 {
                self.markup[ pos ] = self.valid_values_as_bits(pos);
            } else {
                self.markup[ pos ] = 0; 
            }
        }
    }

    fn shuffle<T>(v: &mut [T]) {
        let mut rng = rand::thread_rng();
        let len = v.len();
        for n in 0..len {
            let i = rng.gen_range(0, len - n);
            v.swap(i, len - n - 1);
        }
    } 

    fn solve_randomly( &mut self, limit: usize) {
        self.solution_count = 0;
        self.solution_limit = limit;
        self.solve_recursive_randomly();
    }

    fn solve_recursive_randomly( &mut self ) { 
        // create a list of numbers to test for each cell
        let mut numbers: [usize; GRID_WIDTH] = [0; GRID_WIDTH];
        for pos in 0..GRID_WIDTH { numbers[pos] = pos+1 }
        // find and solve a blank cell
        for pos in 0..GRID_SIZE {
            if self.puzzle[ pos ] == 0 {
                Sudoku::shuffle(&mut numbers);
                let valid_bits = self.valid_values_as_bits(pos);
                for value in 0..GRID_WIDTH {
                    if ( valid_bits & NUM_TO_BITMAP[ numbers[ value ] ] ) > 0 {
                        self.puzzle[ pos ] = numbers[ value ];
                        self.solve_recursive_randomly();  // recurse!
                        if self.solution_count == self.solution_limit { return; }
                        self.puzzle[ pos ] = 0;  // backtrack
                    }
                }
                return;
            }
        }
        // only reaches this point if all cells are solved
        self.solution = self.puzzle;
        self.solution_count += 1;  
        return;
    }

    pub fn generate( &mut self ) {

        // list of grid positions to randomly remove numbers from solved board
        let mut removelist: [usize;GRID_SIZE] = [0; GRID_SIZE];
        for i in 0..GRID_SIZE { removelist[i] = i; }
        Sudoku::shuffle(&mut removelist);
    
        // generate a random puzzle using random solver
        self.puzzle = [0;GRID_SIZE];
        self.solve_randomly(1);
        self.puzzle = self.solution;

        // copy solution to new_given
        let mut new_given = self.solution;
    
        // repeat 81 times        
        for i in 0..GRID_SIZE { 
            let saved_value = new_given[ removelist[i] ];
            // remove a number at random positions on grid
            new_given[ removelist[i] ] = 0;
            self.puzzle = new_given;
            // and confirm there is one and only one solution
            self.solve( 2 );
            if self.solution_count != 1 {
                // or reverse the removal
                new_given[ removelist[i] ] = saved_value;
            }
        }

        // initialize with newly generated givens
        self.initialize_with_array( new_given );
    }

    pub fn reset(&mut self) {
        self.puzzle = self.given;
    }

    pub fn is_solved(&mut self) -> bool {
        for pos in 0..GRID_SIZE{
            if self.puzzle[pos] != self.solution[pos] {
                return false;
            }
        }   
        true
    }

    pub fn to_string( &self ) -> String {
        const NUM_TO_TEXT: [char;10] = ['.','1','2','3','4','5','6','7','8','9'];
        let mut s_given = String::new();
        for pos in 0..GRID_SIZE{
            s_given.push( NUM_TO_TEXT[ self.given[pos] ] );
        }
        s_given
    }

      // Performance Optimizations

    // solves cells that appear once only in row, column or block
    fn solve_lonerangers( &mut self ) {
        let mut r_solved; // row
        let mut c_solved; // column
        let mut b_solved; // block

        self.do_markup();
        loop {

            r_solved = 0;
            for value in 1..GRID_WIDTH+1 {
                let bitmap = NUM_TO_BITMAP[ value ];
                for r in 0..GRID_WIDTH {
                    let mut count = 0;
                    let mut pos = 0;
                    for c in 0..GRID_WIDTH {
                        let p = r*GRID_WIDTH + c;
                        if self.puzzle[ p ] == 0 && (( self.markup[ p ] & bitmap ) > 1) {
                            count+= 1; if count > 1 { break; }
                            pos = p;
                        }
                    }
                    if count == 1 {
                        self.set_value_and_update_markup(pos, value);
                        r_solved += 1;
                    }
                }
            }

            c_solved = 0;
            for value in 1..GRID_WIDTH+1 {
                let bitmap = NUM_TO_BITMAP[ value ];
                for c in 0..GRID_WIDTH {
                    let mut count = 0;
                    let mut pos = 0;
                    for r in 0..GRID_WIDTH {
                        let p = r*GRID_WIDTH + c;
                        if self.puzzle[ p ] == 0 && (( self.markup[ p ] & bitmap ) > 1) {
                            count+= 1; if count > 1 { break; }
                            pos = p;
                        }
                    }
                    if count == 1 {
                        self.set_value_and_update_markup(pos, value);
                        c_solved += 1;
                    }
                }
            }

            b_solved = 0;
            for value in 1..GRID_WIDTH+1 {
                let bitmap = NUM_TO_BITMAP[ value ];
                for b in 0..GRID_WIDTH {
                    let mut count = 0;
                    let mut pos = 0;
                    let tl = (b/GRID_BLOCK_WIDTH)*GRID_WIDTH*GRID_BLOCK_WIDTH + (b % GRID_BLOCK_WIDTH)*GRID_BLOCK_WIDTH;
                    for r in 0..GRID_BLOCK_WIDTH {
                        for c in 0..GRID_BLOCK_WIDTH {
                            let p = tl + r*GRID_WIDTH + c;
                            if self.puzzle[ p ] == 0 && (( self.markup[ p ] & bitmap ) > 1) {
                                count+= 1; if count > 1 { break; }
                                pos = p;
                            }
                            if count > 1 { break; }
                        }
                    }
                    if count == 1 {
                        self.set_value_and_update_markup(pos, value);
                        b_solved += 1;
                    }
                }
            }

            if r_solved + c_solved + b_solved == 0 {
                break;
            }

        }

    }

    fn set_value_and_update_markup( &mut self, pos: usize, value: usize ){
        let y = pos / GRID_WIDTH;
        let x = pos % GRID_WIDTH;
        let topleft = ( y / GRID_BLOCK_WIDTH ) * GRID_BLOCK_WIDTH * GRID_WIDTH + ( x / GRID_BLOCK_WIDTH ) * GRID_BLOCK_WIDTH; 
        self.puzzle[ pos ] = value;
        let bitmap = !NUM_TO_BITMAP[ value ];
        for n in 0..GRID_WIDTH {
            self.markup[ n * GRID_WIDTH + x ] &= bitmap; 
            self.markup[ y * GRID_WIDTH + n ] &= bitmap; 
            self.markup[ topleft + ( n % GRID_BLOCK_WIDTH ) * GRID_WIDTH + ( n / GRID_BLOCK_WIDTH  ) ] &= bitmap;
        }
        self.markup[ pos ] = 0;
    }
       
}