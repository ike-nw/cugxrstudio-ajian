const calculator = document.querySelector('.cal');
const keys = document.querySelector('.buttons');
const display = document.querySelector('.display');
const historyText = document.querySelector('.historyText');
const percision = 9; // maximum reserved digits is 9
const floatReserve = Math.pow(10, percision);

let numArray = []; // to store numbers
let opArray = []; // to store +/- operators

/* ******** MAIN FUNCTION ******** */
keys.addEventListener('click', e => {
    if (e.target.matches('.btn')) {
        const key = e.target;
        const action = key.dataset.action;
        const keyContent = key.textContent;
        const displayedNum = display.textContent;
        const history = historyText.textContent;
        const previousKeyType = calculator.dataset.previousKeyType;
        const previousOperator = calculator.dataset.previousOperator;

        if (history.includes('Copied')) historyText.textContent = ''; // clear 'Copied' in history after copied

        switch (action) {
            case undefined: // if action has no value, it must be a number key
                if (displayedNum.length <= percision - 1 || previousKeyType === 'operator') { // limit inputted number length
                    if (history.includes('=') || history.includes('Copied')) { // EDGE CASE: try to input a new number but clear hasn't been clicked after last calculation
                        if (previousKeyType === 'number' || previousKeyType === 'decimal') { // input digit consecutively
                            display.textContent = displayedNum + keyContent;
                        } else { // replace result of last calculation
                            historyText.textContent += displayedNum;
                            display.textContent = keyContent;
                        }
                    } else if (displayedNum === '0' || previousKeyType === 'operator') { // initial state or try to add the next number after clicking the operator key
                        display.textContent = keyContent;
                    } else { // input digit consecutively
                        display.textContent = displayedNum + keyContent;
                    }
                }
                calculator.dataset.previousKeyType = 'number';
                break;

            case 'decimal':
                if (!displayedNum.includes('.')) { // if there is no decimal point, add one
                    display.textContent = displayedNum + '.';
                }
                if (previousKeyType === 'operator' || history.includes('Copied') || history.includes('=')) { // EDGE CASE: try to input 0.X without inputting 0
                    if (history.includes('=')) historyText.textContent += displayedNum; // EDGE CASE: try to input a new number but clear hasn't been clicked
                    display.textContent = '0.';
                }
                calculator.dataset.previousKeyType = 'decimal';
                break;

            case 'oppositeNum':
                if (displayedNum !== '0') display.textContent = displayedNum * -1;
                calculator.dataset.previousKeyType = 'oppositeNum';
                break;

            case 'clearAll':
                display.textContent = '0';
                historyText.textContent = '';
                calculator.dataset.previousKeyType = '';
                numArray = [];
                opArray = [];
                break;

            case 'clearEntry':
                if (history.includes('=') || history.includes('Copied')) { // if calculation is finished, AE and C is the same
                    display.textContent = '0';
                    historyText.textContent = '';
                    calculator.dataset.previousKeyType = '';
                    numArray = [];
                    opArray = [];
                } else display.textContent = '0';
                break;

            case 'calculate':

                /* --------------------------
                Evaluate the multiplication or division among two numbers immediately,
                then store the result to the numArray.
                Only store numbers that need to added or subtracted to the numArray,
                and store =/- operators to the opArray.
                Calculate additions and subtractions at last.
                -------------------------- */

                let finalResult;

                if (!history.includes('=') && previousOperator) {
                    // CALCULATION
                    if (previousOperator === '×' || previousOperator === '÷') { // if try to multiply or divide, evaluate immediately
                        const __result = showResult(numArray.pop(), previousOperator, displayedNum)
                        numArray.push(__result);
                    }
                    if (opArray.length > 0) { // no +/- operators in opArray means no additions or subtractions need to calculate
                        numArray.push(displayedNum);
                        let calculatedResult = showResult(numArray[0], opArray[0], numArray[1]); // calculate first two numbers

                        if (opArray.length > 1) { // calculate others one by one
                            for (let i = 1; i < opArray.length; i++) {
                                calculatedResult = showResult(calculatedResult, opArray[i], numArray[i + 1]);
                            }
                        }
                        finalResult = Math.round(calculatedResult * floatReserve) / floatReserve; // avoid float calculation error of Javascript
                    } else { // multiply and divide all the way, just print the only number of the numArray
                        finalResult = Math.round(numArray[numArray.length - 1] * floatReserve) / floatReserve;
                    }

                    // OPTIMIZE THE RESULT FOR DISPLAYING
                    const resultLength = finalResult.toString().length;
                    if (resultLength <= 9) { // normally display
                        console.log('normally display');
                        display.textContent = finalResult;
                    }
                    else if (finalResult <= 99999999) { // optimize mantissa
                        if (finalResult < 10 && finalResult > -10) display.textContent = finalResult.toFixed(8);
                        else if (finalResult >= 10 && finalResult < 100 || finalResult <= -10 && finalResult > -100) display.textContent = finalResult.toFixed(7);
                        else if (finalResult >= 100 && finalResult < 1000 || finalResult <= -100 && finalResult > -1000) display.textContent = finalResult.toFixed(6);
                        else if (finalResult >= 1000 && finalResult < 10000 || finalResult <= -1000 && finalResult > -10000) display.textContent = finalResult.toFixed(5);
                        else if (finalResult >= 10000 && finalResult < 100000 || finalResult <= -10000 && finalResult > -100000) display.textContent = finalResult.toFixed(4);
                        else if (finalResult >= 100000 && finalResult < 1000000 || finalResult <= -100000 && finalResult > -1000000) display.textContent = finalResult.toFixed(3);
                        else if (finalResult >= 1000000 && finalResult < 10000000 || finalResult <= -1000000 && finalResult > -10000000) display.textContent = finalResult.toFixed(2);
                        else if (finalResult >= 10000000 && finalResult < 100000000 || finalResult <= -10000000 && finalResult > -100000000) display.textContent = finalResult.toFixed(1);
                    } else { // convert big numbers to scientific notation
                        console.log('scientific notation');
                        finalResult = finalResult.toExponential().toString();
                        let approxResult = finalResult.split('e');
                        const _n1 = approxResult.shift();
                        let _newN1 = Math.round(_n1); // optimize mantissa
                        const _newN1Strings = _newN1.toString();
                        if (_newN1Strings.length >= 2 && !_newN1Strings.includes('.')) { // for numbers between 10 - 20, only reserve 1 digit
                            _newN1 /= 10;
                            approxResult.push(_newN1);
                            approxResult[0] = parseInt(approxResult[0]) + 1;
                            display.textContent = approxResult[1] + 'e' + '+' + approxResult[0];
                        } else {
                            approxResult.push(_newN1);
                            display.textContent = approxResult[1] + 'e' + approxResult[0];
                        }
                    }

                    // DISPLAY RESULT
                    historyText.textContent += displayedNum + '=';

                    // INITIALIZATION
                    numArray = [];
                    opArray = [];
                    calculator.dataset.previousOperator = '';
                }

                calculator.dataset.previousKeyType = 'calculate';

                // console.log(numArray);
                // console.log(opArray);
                // console.log(previousOperator);

                break;

            default: // only operators left
                if (history.includes('=')) historyText.textContent = ''; // clear history

                if (previousKeyType !== 'operator') {
                    if (previousOperator === '×' || previousOperator === '÷') { // if try to multiply or divide, evaluate immediately
                        const _result = showResult(numArray.pop(), previousOperator, displayedNum);
                        numArray.push(_result);
                    } else numArray.push(displayedNum);
                    if (action === '+' || action === '-') opArray.push(action);
                    calculator.dataset.previousOperator = action;

                    if (!historyText.textContent) {
                        const txt = document.createTextNode(displayedNum + action);
                        historyText.appendChild(txt);
                    } else historyText.textContent += displayedNum + action;

                } else { // EDGE CASE: already inputted an operator but try to change to another
                    if (previousOperator === '+' || previousOperator === '-') opArray.pop();
                    if (action === '+' || action === '-') opArray.push(action);
                    calculator.dataset.previousOperator = action;

                    historyText.textContent = historyText.textContent.slice(0, -1) + action;
                }
                calculator.dataset.previousKeyType = 'operator';
                break;
        }
    }
})

/* ******** COPY RESULT FUNCTION ******** */
display.addEventListener('click', e => {
    if (e.target.matches('.display') && historyText.textContent.includes('=')) {
        historyText.textContent = 'Copied';
        navigator.clipboard.writeText(display.textContent);
    }
    calculator.dataset.previousKeyType = 'copy';
})

/* ******** KEYBOARD INPUT ******** */
document.onkeydown = e => {
    const keyCode = e.code;
    if (e.shiftKey) {
        switch (keyCode) {
            case 'Equal':
                document.querySelector('[data-action="+"]').click();
                break;
            case 'Digit8':
                document.querySelector('[data-action="×"]').click();
                break;
        }
    } else {
        switch (keyCode) {
            case 'Digit1': document.getElementById('1').click(); break;
            case 'Digit2': document.getElementById('2').click(); break;
            case 'Digit3': document.getElementById('3').click(); break;
            case 'Digit4': document.getElementById('4').click(); break;
            case 'Digit5': document.getElementById('5').click(); break;
            case 'Digit6': document.getElementById('6').click(); break;
            case 'Digit7': document.getElementById('7').click(); break;
            case 'Digit8': document.getElementById('8').click(); break;
            case 'Digit9': document.getElementById('9').click(); break;
            case 'Digit0': document.getElementById('0').click(); break;
            case 'Slash': document.querySelector('[data-action="÷"]').click(); break;
            case 'Minus': document.querySelector('[data-action="-"]').click(); break;
            case 'Equal': document.querySelector('[data-action="calculate"]').click(); break;
            case 'Period': document.querySelector('[data-action="decimal"]').click(); break;
            case 'Enter': document.querySelector('[data-action="calculate"]').click(); break;
            case 'Escape': document.querySelector('[data-action="clearAll"]').click(); break;
            case 'Backspace': document.querySelector('[data-action="clearEntry"]').click(); break;
        }
    }
}

/* ******* CALCULATION FUNCTION ******* */
function showResult(_first, _operator, _last) {
    let _result = '';
    if (_operator === '+') {
        _result = parseFloat(_first) + parseFloat(_last);
    }
    else if (_operator === '-') {
        _result = parseFloat(_first) - parseFloat(_last);
    }
    else if (_operator === '×') {
        _result = parseFloat(_first) * parseFloat(_last);
    }
    else if (_operator === '÷') {
        _result = parseFloat(_first) / parseFloat(_last);
    }
    return _result;
}
