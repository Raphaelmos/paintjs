const canvas = document.getElementById('jsCanvas');
const ctx = canvas.getContext('2d');

ctx.lineWidtx = 2.5;
ctx.strokeStyle = '#2c2c2c';

let painting = false

function stopPainting(){
    painting = false;
}

function startPaiting(){
    painting = true 
}

function onMouseMove(event) {
    x = event.offsetX;
    y = event.offsetY;
    if(!painting) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function onMouseDown(event) {
    painting = true 
}


function onMouseLeave(event){
    stopPainting()
}

if (canvas) {
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', stopPainting());
    canvas.addEventListener('mouseleave', stopPainting());
}
