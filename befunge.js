function init()
{
    document.getElementById("input").value = "\"dlroW olleH\">:v\n             ^,_@";
}

function run()
{
    let input = document.getElementById("input").value;
    let lines = input.split("\n");
    let rows = lines.length;
    let cols = Math.max(...lines.map(s => s.length));
    let source = new Array(rows);
    for (let y = 0; y < rows; y++)
        source[y] = lines[y].padEnd(cols);

    let output = document.getElementById("output");
    try {
        let result = exec(source);
        output.value = result;
        output.hidden = false;
    } catch (e) {
        output.value = "Error: " + e.toString();
        output.hidden = false;
    }
}

function test()
{
    const tests = [
        [ [ '"dlroW olleH">:v ',
            '             ^,_@' ],
          "Hello World" ],
        [ [ '"!dlroW ,olleH">:#,_@' ],
          "Hello, World!" ]
    ];
    
    let output = document.getElementById("output");
    output.value = "";
    output.hidden = false;

    let i = 0;
    let pass = true;
    for (let [source, expected] of tests) {
        let result;
        let ok = false;
        try {
            result = exec(source);
            ok = true;
        } catch (e) {
            result = "Exception: " + e.toString();
        }

        if (ok && result == expected) {
            output.value += `Test ${i}: pass\n`;
        } else {
            output.value += `Test ${i}: failed: got ${result}, expected ${expected}\n`;
            pass = false;
        }
        i++;
    }

    if (!pass)
        output.value += `FAILED\n`;
}

function exec(source)
{
    const rows = source.length;
    const cols = source[0].length;

    for (let line of source) {
        if (line.length != cols)
            throw "Source line lengths not equal";
    }

    let px = 0, py = 0;
    let dx = 1, dy = 0;

    let stack = [];
    let stringMode = false;

    let step = 0;
    const maxSteps = 1000;

    let result = "";

    function push(v) {
        stack.push(v);
    }
    function peek() {
        return stack.length == 0 ? 0 : stack[stack.length - 1];
    }
    function pop() {
        return stack.length == 0 ? 0 : stack.pop();
    }
    function add(a, b) {
        return b + a;
    }
    function sub(a, b) {
        return b - a;
    }
    function div(a, b) {
        return b / a;
    }
    function mod(a, b) {
        return b % a;
    }
    function setMoveRight() {
        dx = 1; dy = 0;
    }
    function setMoveLeft() {
        dx = -1; dy = 0;
    }
    function setMoveUp() {
        dx = 0; dy = -1;
    }
    function setMoveDown() {
        dx = 0; dy = 1;
    }
    function horizontalIf(v) {
        v === 0 ? setMoveRight() : setMoveLeft();
    }
    function vertiacalIf(v) {
        v === 0 ? setMoveDown() : setMoveUp();
    }
    function outputAscii(v) {
        result += String.fromCharCode(v);
    }
    function updateCoord(v, dir, max) {
        v = v + dir;
        if (v < 0)
            v += max;
        else if (v >= max)
            v -= max;
        return v;
    }
    function move() {
        px = updateCoord(px, dx, cols);
        py = updateCoord(py, dy, rows);
    }

    while (true) {
        if (step++ == maxSteps)
            throw "Reached max steps";

        let c = source[py][px];

        if (stringMode) {
            if (c == '"')
                stringMode = false;
            else
                push(c.charCodeAt(0));
        } else if (/^[0-9]$/.test(c)) {
            push(parseInt(c));
        } else {
            switch (c) {
            case ' ': break;
            case '+': push(add(pop(), pop())); break;
            case '-': push(sub(pop(), pop())); break;
            case '*': push(pop() * pop());     break;
            case '/': push(div(pop(), pop())); break;
            case '%': push(mod(pop(), pop())); break;
            case '"': stringMode = true;       break;
            case '>': setMoveRight();          break;
            case '<': setMoveLeft();           break;
            case '^': setMoveUp();             break;
            case 'v': setMoveDown();           break;
            case ':': push(peek());            break;
            case '_': horizontalIf(pop());     break;
            case '|': vertiacalIf(pop());      break;
            case ',': outputAscii(pop());      break;
            case '#': move();                  break;
            case '@': return result;
            default:  throw "Unknown command: " + c;
            }
        }

        move();
    }
}
