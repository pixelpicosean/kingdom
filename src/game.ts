const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Rectangle dimensions
const rect_w = 200;
const rect_h = 150;

// Calculate center position
const center_x = canvas.width / 2;
const center_y = canvas.height / 2;
const rect_x = center_x - rect_w / 2;
const rect_y = center_y - rect_h / 2;

// Draw rectangle at center
ctx.fillStyle = '#4a90e2';
ctx.fillRect(rect_x, rect_y, rect_w, rect_h);

// Optional: Add a border
ctx.strokeStyle = '#2c5aa0';
ctx.lineWidth = 2;
ctx.strokeRect(rect_x, rect_y, rect_w, rect_h);
