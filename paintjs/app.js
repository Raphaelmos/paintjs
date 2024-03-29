const CANVAS_SIZE = 800;
const INITIAL_COLOR = '#2c2c2c';

const canvas = document.querySelector('canvas');
const mode = document.getElementById('jsMode');
const ctx = canvas.getContext('2d');
const saveBtn = document.getElementById('jsSave');
const range = document.getElementById('jsRange');

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
            const radius = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        } break;
        case "polygone": {
            console.log("polygon");
            ctx.putImageData(startImage, 0, 0);
            getPolygon(x, y);
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
    startImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    startPoint = { x, y };
}

function paintEnd(event) {
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

const polygonSides = 5;

// Holds x & y polygon point values
class PolygonPoint {
    constructor(x, y) {
        this.x = x, this.y = y;
    }
}

// Returns the angle using x and y
// x = Adjacent Side
// y = Opposite Side
// Tan(Angle) = Opposite / Adjacent
// Angle = ArcTan(Opposite / Adjacent)
function getAngleUsingXAndY(x, y) {
    let adjacent = x - startPoint.x;
    let opposite = y - startPoint.y;

    return radiansToDegrees(Math.atan2(opposite, adjacent));
}

function radiansToDegrees(rad) {
    if (rad < 0) {
        // Correct the bottom error by adding the negative
        // angle to 360 to get the correct result around circle
        return (360.0 + (rad * (180 / Math.PI))).toFixed(2);
    } else {
        return (rad * (180 / Math.PI)).toFixed(2);
    }
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function getPolygonPoints(x, y) {
    // Get angle in radians based on x & y of mouse location
    let angle = degreesToRadians(getAngleUsingXAndY(startPoint.x, startPoint.y));

    // X & Y for the X & Y point representing the radius is equal to
    // the X & Y of the bounding rubberband box
    const width = x - startPoint.x;
    const height = y - startPoint.y;
    let radiusX = width;
    let radiusY = height;
    let polygonPoints = [];

    for (let i = 0; i < polygonSides; i++) {
        polygonPoints.push(new PolygonPoint(
            startPoint.x + radiusX * Math.sin(angle),
            startPoint.y - radiusY * Math.cos(angle)
        ));


        angle += 2 * Math.PI / polygonSides;
    }
    return polygonPoints;
}

// Get the polygon points and draw the polygon
function getPolygon(x, y) {
    console.log("getPolygon");
    let polygonPoints = getPolygonPoints(x, y);
    console.log(polygonPoints);
    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonSides; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}

function handleSaveClick(){
    const image = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = image;
    link.download = "Exportation du dessin";
    link.click();
}

if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveClick);
}

if (range) {
    range.addEventListener('input', handleRangeChange);
}

function handleRangeChange(event){
    const rangeValue = event.target.value;
    ctx.lineWidth = rangeValue;
}

function OpenImage(){
    let img = new Image();
    // Once the image is loaded clear the canvas and draw it
    img.onload = function(){
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.drawImage(img,0,0);
    }
    img.src = 'image.png';

}
const openFileBtn = document.getElementById('open-file');
fileInput.addEventListener('change', () => {

  const file = fileInput.files[0];

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  }

  img.src = URL.createObjectURL(file);

})
