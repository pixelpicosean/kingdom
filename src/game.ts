const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

ctx.fillStyle = 'blue';
ctx.fillRect(0, 0, canvas.width/2, canvas.height);

ctx.fillStyle = 'yellow';
ctx.fillRect(canvas.width/2,0,canvas.width/2, canvas.height);

ctx.fillStyle = 'rgb(186, 19, 19)';
ctx.font = '30px Arial';
ctx.textBaseline = 'top';
ctx.textAlign = 'left';
ctx.fillText('Hello, world!', 0, 0);
