import React, { Component } from 'react';
import './styles.css';
import _ from 'lodash';

var possibleCombinationSum = function(arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
      arr.pop();
      return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount ; i++ ) {
      var combinationSum = 0;
      for (var j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }
    return false;
  };

const Stars = (props) => {
    return(
        <div className = "col-md-5">
            {_.range(props.numberOfStars).map(i =>
                <i key = {i} className = "fa fa-star"></i>
            )}
        </div>
    );
}

const Button = (props) => {

    let button;

    switch(props.answerIsCorrect) {
        case true:
            button =
                <button className = "btn btn-success" onClick = {props.acceptedAnswer}>
                    <i className = "fa fa-check"></i>
                </button>;
            break;
        case false:
            button =
                <button className = "btn btn-danger">
                    <i className = "fa fa-times"></i>
                </button>;
            break;
        default:
            button =
                <button className = "btn" 
                        onClick = {props.checkAnswer} 
                        disabled = {props.selectedNumbers.length === 0}>
                    =
                </button>;
            break;
    }

    return(
        <div className = "col-md-2 text-center">
            {/* <button className = "btn" disabled = {props.selectedNumbers.length === 0}>=</button> */}
            {button}
            <br /><br />
            <button className = "btn btn-warning btn-sm" onClick = {props.redraw} disabled = {props.redraws === 0}>
                <i className = "fa fa-refresh"></i> {props.redraws}
            </button>
        </div>
    )
}

const Answers = (props) => {
    return(
        <div className = "col-md-5">
            {props.selectedNumbers.map((number, i) =>
                <span key = {i} onClick = {() => props.unselectedNumber(number)}>
                    {number}
                </span>
            )}
        </div>
    )
}

const Numbers = (props) => {

    const numberClassName = (number) => {
        if(props.usedNumbers.indexOf(number) >= 0) {
            return 'used';
        }

        if(props.selectedNumbers.indexOf(number) >= 0) {
            return 'selected';
        }
    }

    return(
        <div className = "card text-center">
            <div>
                {Numbers.list.map((number, i) =>
                    <span key = {i} className = {numberClassName(number)}
                            onClick = {() => props.selectNumber(number)}>
                        {number}
                    </span>
                )}
            </div>
        </div>
    );
}
Numbers.list = _.range(1, 10);

const DoneFrame = (props) => {
    return(
        <div className = "text-center">
            <h2>{props.doneStatus}</h2>
            <button className = "btn btn-secondary" onClick = {props.resetGame}>
                Play Again
            </button>
        </div>
    );
}

class Game extends Component {

    static randomNumber = () => 1 + Math.floor(Math.random() * 9);

    static initialState = () => ({
        selectedNumbers : [],
        randonNumberOfStars : Game.randomNumber(),
        usedNumbers : [],
        answerIsCorrect : null,
        redraws : 5,
        doneStatus: null
    });

    state = Game.initialState();

    resetGame = () => this.setState(Game.initialState());

    selectNumber = (clickedNumber) => {

        if(this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
            return ;
        }

        this.setState(prevState => ({
            answerIsCorrect : null,
            selectedNumbers : prevState.selectedNumbers.concat(clickedNumber)
        }));
    };

    unselectedNumber = (clickedNumber) => {
        this.setState(prevState => ({
            answerIsCorrect : null,
            selectedNumbers : prevState.selectedNumbers.filter(number => number !== clickedNumber)
        }));
    }

    checkAnswer = () => {
        this.setState(prevState => ({
            answerIsCorrect : prevState.randonNumberOfStars === prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
        }));
    };

    acceptedAnswer = () => {
        this.setState(prevState => ({
            usedNumbers : prevState.usedNumbers.concat(prevState.selectedNumbers),
            selectedNumbers : [],
            answerIsCorrect : null,
            randonNumberOfStars : Game.randomNumber()
        }), this.updateDoneStatus);
    };

    redraw = () => {

        if(this.state.redraws === 0) { return; }

        this.setState(prevState => ({
            randonNumberOfStars : 1 + Game.randomNumber(),
            answerIsCorrect : null,
            selectedNumbers : [],
            redraws : prevState.redraws -1
        }), this.updateDoneStatus);
    };

    possibleSolutions = ({randonNumberOfStars, usedNumbers}) => {
        const possibleNumbers = _.range(1, 10).filter(number =>
            usedNumbers.indexOf(number) === -1
        );

        return possibleCombinationSum(possibleNumbers, randonNumberOfStars)
    };

    updateDoneStatus = () => {
        this.setState(prevState => {
            if(prevState.usedNumbers.length === 9) {
                return { doneStatus : 'Done, Nice!' };
            }

            if(prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
                return { doneStatus : 'Game Over!' };
            }
        });
    }

    render() {

        const { 
            selectedNumbers, 
            randonNumberOfStars,
            answerIsCorrect,
            usedNumbers,
            redraws,
            doneStatus
         } = this.state;

        return(
            <div className = "container">
                <h3>Play Nine</h3>
                <hr />
                <div className = "row">
                    <Stars numberOfStars = {randonNumberOfStars} />
                    <Button selectedNumbers = {selectedNumbers} /**It's calling a attribute inside of the Game component (this.state.selectedNumber) */ 
                            redraws = {redraws} 
                            checkAnswer = {this.checkAnswer}    /**It's calling a function inside of the Game component */
                            acceptedAnswer = {this.acceptedAnswer} 
                            redraw = {this.redraw}
                            answerIsCorrect = {answerIsCorrect} />
                    <Answers selectedNumbers = {selectedNumbers} 
                            unselectedNumber = {this.unselectedNumber} />
                </div>
                <br />
                {doneStatus ?
                    <DoneFrame resetGame = {this.resetGame} 
                                doneStatus = {doneStatus} /> :
                    <Numbers selectedNumbers = {selectedNumbers}
                        selectNumber = {this.selectNumber} 
                        usedNumbers = {usedNumbers} />
                }
            </div>
        );
    }
}

class AppGame extends Component {
    render() {
        return(
            <div>
                <Game />
            </div>
        );
    }
}

export default AppGame;