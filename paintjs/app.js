const CANVAS_SIZE = 800;
const INITIAL_COLOR = '#2c2c2c';

const canvas = document.querySelector('canvas');
const mode = document.getElementById('jsMode');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

let paintColor = INITIAL_COLOR;
let currentTool = 'brush';
let painting = false;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

ctx.strokeStyle = paintColor;
ctx.fillStyle = paintColor;
ctx.lineWidth = 2.5;

let paintMode = 'peindre';

function togglePaintMode() {
    console.log("toggle paint mode");
    if (paintMode === 'peindre') {
        mode.innerText = 'Remplir';
        paintMode = 'remplir';
    } else {
        mode.innerText = 'Peindre';
        paintMode = 'peindre';
    }
}

if (canvas) {
    canvas.addEventListener('contextmenu', disableContextMenu);
    canvas.addEventListener('click', () => { if (paintMode == 'remplir') fillCanvas(); });
    canvas.addEventListener('mousedown', paintBegin);
}

function disableContextMenu(event) {
    event.preventDefault();
}

function fillCanvas() {
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

let startImage = null;
let startPoint = { x: 0, y: 0 };

function paintCanvas(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    switch (currentTool) {
        case "brush": {
            ctx.lineTo(x, y);
            ctx.stroke();
        } break;
        case "ligne": {
            ctx.putImageData(startImage, 0, 0);
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } break;
        case "rectangle": {
            ctx.putImageData(startImage, 0, 0);
            const width = x - startPoint.x;
            const height = y - startPoint.y;
            ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        } break;
        case "cercle": {
            ctx.putImageData(startImage, 0, 0);
            const width = x - startPoint.x;
            const height = y - startPoint.y;
            const radius = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        } break;
    }
}

function paintBegin(event) {
    canvas.addEventListener('mousemove', paintCanvas);
    canvas.addEventListener('mouseup', paintEnd);
    canvas.addEventListener('mouseleave', paintEnd);
    const x = event.offsetX;
    const y = event.offsetY;
    ctx.beginPath();
    ctx.moveTo(x, y);

    // don't need this yet
    startImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    startPoint = { x, y };
    switch (currentTool) {
        // case "ellipse": {
        //     let radiusX = 100 / 2;
        //     let radiusY = 50 / 2;
        //     ctx.beginPath();
        //     ctx.ellipse(x, y, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2);
        //     ctx.stroke();
        // } break;
        case "polygone": {
            getPolygon();
            ctx.stroke();
        } break;
    }
}

function paintEnd(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    switch (currentTool) {
        case "brush": { } break;
    }
    canvas.removeEventListener('mousemove', paintCanvas);
    canvas.removeEventListener('mouseup', paintEnd);
    canvas.removeEventListener('mouseleave', paintEnd);
}

// Setup click handler for jsColor buttons
const colorButtons = Array.from(document.getElementsByClassName('jsColor'));

colorButtons.forEach(button =>
    button.addEventListener('click', (e) =>
        changePaintColor(e.target.style.backgroundColor)));

function changePaintColor(clickedColor) {
    paintColor = clickedColor;
    ctx.strokeStyle = clickedColor;
    ctx.fillStyle = clickedColor;
}

function changePaintTool(clickedTool) {
    console.log(clickedTool);
    const toolList = [
        // "open", "save","ellipse",
        "brush", "ligne", "rectangle", "cercle", "polygone"
    ];
    toolList.forEach(toolName => document.getElementById(toolName).className = "");
    document.getElementById(clickedTool).className = "selected";
    currentTool = clickedTool;
}

// Polygon Code

// Returns the angle using x and y
// x = Adjacent Side
// y = Opposite Side
// Tan(Angle) = Opposite / Adjacent
// Angle = ArcTan(Opposite / Adjacent)
function getAngleUsingXAndY(x, y) {
    let adjacent = mousedown.x - x;
    let opposite = mousedown.y - y;

    return radiansToDegrees(Math.atan2(opposite, adjacent));
}

function radiansToDegrees(rad) {
    if (rad < 0) {
        // Correct the bottom error by adding the negative
        // angle to 360 to get the correct result around
        // the whole circle
        return (360.0 + (rad * (180 / Math.PI))).toFixed(2);
    } else {
        return (rad * (180 / Math.PI)).toFixed(2);
    }
}

// Converts degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function getPolygonPoints(x, y) {
    // Get angle in radians based on x & y of mouse location
    let angle = degreesToRadians(getAngleUsingXAndY(x, y));

    // X & Y for the X & Y point representing the radius is equal to
    // the X & Y of the bounding rubberband box
    let radiusX = 100;
    let radiusY = 50;
    // Stores all points in the polygon
    let polygonPoints = [];

    // Each point in the polygon is found by breaking the 
    // parts of the polygon into triangles
    // Then I can use the known angle and adjacent side length
    // to find the X = mouseLoc.x + radiusX * Sin(angle)
    // You find the Y = mouseLoc.y + radiusY * Cos(angle)
    for (let i = 0; i < polygonSides; i++) {
        polygonPoints.push(new PolygonPoint(
            x + radiusX * Math.sin(angle),
            y - radiusY * Math.cos(angle)
        ));
        // 2 * PI equals 360 degrees
        // Divide 360 into parts based on how many polygon 
        // sides you want 
        angle += 2 * Math.PI / polygonSides;
    }
    return polygonPoints;
}

// Get the polygon points and draw the polygon
function getPolygon(x, y) {
    let polygonPoints = getPolygonPoints(x, y);
    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonSides; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    ctx.closePath();
}
