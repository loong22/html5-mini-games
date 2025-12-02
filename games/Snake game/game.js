// 游戏常量
const GRID_SIZE = 25;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const INITIAL_SNAKE = [{ x: 200, y: 200 }];
const INITIAL_DIRECTION = { x: GRID_SIZE, y: 0 };

// 难度级别配置 - 不同难度有明显速度差异
const DIFFICULTY_LEVELS = {
    easy: { name: '简单', initialSpeed: 400, speedIncrement: 1, maxSpeed: 250 }, // 慢速
    medium: { name: '中等', initialSpeed: 350, speedIncrement: 2, maxSpeed: 150 }, // 中等
    hard: { name: '困难', initialSpeed: 300, speedIncrement: 3, maxSpeed: 100 } // 快速
};

// Snake 类
class Snake {
    constructor() {
        this.body = [...INITIAL_SNAKE];
        this.direction = { ...INITIAL_DIRECTION };
        this.nextDirection = { ...INITIAL_DIRECTION };
        this.animationTime = 0;
    }

    move() {
        this.direction = { ...this.nextDirection };
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        this.body.unshift(head);
        this.body.pop();
    }

    grow() {
        const tail = this.body[this.body.length - 1];
        const newSegment = {
            x: tail.x - this.direction.x,
            y: tail.y - this.direction.y
        };
        this.body.push(newSegment);
    }

    checkCollision() {
        const head = this.body[0];
        if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT) {
            return true;
        }
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        this.animationTime += 0.016;
        
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            const isHead = i === 0;
            const alpha = 1 - (i / this.body.length) * 0.3; // 尾部逐渐透明

            if (isHead) {
                // 蛇头脉冲光晕
                const pulse = Math.sin(this.animationTime * 3) * 0.2 + 0.8;
                ctx.fillStyle = `rgba(102, 187, 106, ${0.3 * pulse})`;
                ctx.beginPath();
                ctx.arc(segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2 + 3, 0, Math.PI * 2);
                ctx.fill();

                // 蛇头主体
                const headGradient = ctx.createRadialGradient(
                    segment.x + GRID_SIZE/3, segment.y + GRID_SIZE/3,
                    0, segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2,
                    GRID_SIZE/2
                );
                headGradient.addColorStop(0, '#88DD88');
                headGradient.addColorStop(0.6, '#66BB6A');
                headGradient.addColorStop(1, '#4CAF50');
                ctx.fillStyle = headGradient;
                ctx.beginPath();
                ctx.arc(segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2 - 1, 0, Math.PI * 2);
                ctx.fill();

                // 蛇头高光
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(segment.x + GRID_SIZE/3 + 1, segment.y + GRID_SIZE/3 - 1, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // 眼睛白色部分
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(segment.x + GRID_SIZE/3, segment.y + GRID_SIZE/3, 3, 0, Math.PI * 2);
                ctx.arc(segment.x + GRID_SIZE*2/3, segment.y + GRID_SIZE/3, 3, 0, Math.PI * 2);
                ctx.fill();

                // 眼睛黑色瞳孔
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(segment.x + GRID_SIZE/3, segment.y + GRID_SIZE/3, 1.5, 0, Math.PI * 2);
                ctx.arc(segment.x + GRID_SIZE*2/3, segment.y + GRID_SIZE/3, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // 蛇身渐变
                const bodyGradient = ctx.createLinearGradient(
                    segment.x, segment.y,
                    segment.x + GRID_SIZE, segment.y + GRID_SIZE
                );
                bodyGradient.addColorStop(0, '#66BB6A');
                bodyGradient.addColorStop(0.5, '#4CAF50');
                bodyGradient.addColorStop(1, '#2E7D32');
                
                ctx.fillStyle = bodyGradient;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.ellipse(segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2 - 1, GRID_SIZE/2 - 1, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // 蛇身高光
                ctx.fillStyle = 'rgba(136, 221, 136, 0.5)';
                ctx.beginPath();
                ctx.ellipse(segment.x + GRID_SIZE/2 - 2, segment.y + GRID_SIZE/2 - 2, GRID_SIZE/3, GRID_SIZE/3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Food 类
class Food {
    constructor(snakeBody = []) {
        this.position = this.generatePosition(snakeBody);
        this.animationTime = 0;
        this.particles = this.generateParticles();
    }

    generatePosition(snakeBody) {
        let newPosition;
        let attempts = 0;
        const maxAttempts = 1000;

        do {
            newPosition = {
                x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE,
                y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE
            };
            attempts++;
        } while (this.isPositionOccupied(newPosition, snakeBody) && attempts < maxAttempts);

        return newPosition;
    }

    isPositionOccupied(position, snakeBody) {
        return snakeBody.some(segment => segment.x === position.x && segment.y === position.y);
    }

    generateParticles() {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            particles.push({
                angle: angle,
                distance: GRID_SIZE / 2 + 2
            });
        }
        return particles;
    }

    draw(ctx) {
        this.animationTime += 0.016;
        const centerX = this.position.x + GRID_SIZE / 2;
        const centerY = this.position.y + GRID_SIZE / 2;
        const radius = GRID_SIZE / 2 - 2;

        // 脉冲发光效果
        const pulse = Math.sin(this.animationTime * 3) * 0.4 + 0.6;
        const rotation = this.animationTime * 1.5;
        
        // 粒子光晕
        ctx.fillStyle = `rgba(255, 100, 100, ${0.15 * pulse})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制旋转的粒子
        this.particles.forEach((particle, index) => {
            const x = centerX + Math.cos(particle.angle + rotation) * particle.distance;
            const y = centerY + Math.sin(particle.angle + rotation) * particle.distance;
            ctx.fillStyle = `rgba(255, 150, 100, ${0.6 * pulse})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // 苹果主体（红色渐变）
        const appleGradient = ctx.createRadialGradient(centerX - 2, centerY - 2, 0, centerX, centerY, radius);
        appleGradient.addColorStop(0, '#FF8888');
        appleGradient.addColorStop(0.6, '#FF5555');
        appleGradient.addColorStop(1, '#DD2222');
        ctx.fillStyle = appleGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 苹果阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY + radius - 2, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // 苹果高光（3D效果）
        ctx.fillStyle = '#FFBBBB';
        ctx.beginPath();
        ctx.arc(centerX - 3, centerY - 3, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // 苹果梗
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius - 2);
        ctx.quadraticCurveTo(centerX + 1, centerY - radius - 1, centerX, centerY - radius + 3);
        ctx.stroke();

        // 苹果梗高光
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 0.5, centerY - radius - 1);
        ctx.lineTo(centerX - 0.5, centerY - radius + 2);
        ctx.stroke();

        // 叶子（旋转动画）
        ctx.save();
        ctx.translate(centerX + 2, centerY - radius - 1);
        ctx.rotate(Math.sin(this.animationTime * 2) * 0.3);
        
        const leafGradient = ctx.createLinearGradient(-4, -2, 4, 2);
        leafGradient.addColorStop(0, '#1a7a1a');
        leafGradient.addColorStop(0.5, '#2ecc71');
        leafGradient.addColorStop(1, '#27ae60');
        ctx.fillStyle = leafGradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Game 类
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.snake = new Snake();
        this.food = new Food(this.snake.body);
        this.score = 0;
        this.highScore = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;

        this.selectedDifficulty = 'medium';
        this.difficulty = this.selectedDifficulty;
        this.currentSpeed = DIFFICULTY_LEVELS[this.difficulty].initialSpeed;
        this.baseSpeed = this.currentSpeed;

        this.keyPressed = false;
        this.boostActive = false;

        this.backgroundTime = 0;

        this.bindEvents();
        this.updateScoreDisplay();
        this.updateDifficultyDisplay();
        this.updateButtonVisibility();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.updateButtonVisibility();
        setTimeout(() => {
            if (this.isRunning) {
                this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
            }
        }, 500);
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.gameLoop);
        this.updateButtonVisibility();
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            this.updateButtonVisibility();
            console.log('游戏已暂停');
        }
    }

    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.difficulty = this.selectedDifficulty;
            this.currentSpeed = DIFFICULTY_LEVELS[this.difficulty].initialSpeed;
            this.baseSpeed = this.currentSpeed;
            this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
            this.updateButtonVisibility();
            console.log('游戏已恢复，难度:', this.difficulty, '速度:', this.currentSpeed);
        }
    }

    updateButtonVisibility() {
        const startButton = document.getElementById('startButton');
        const pauseButton = document.getElementById('pauseButton');
        const difficultySelect = document.getElementById('difficultySelect');

        if (!this.isRunning) {
            startButton.style.display = 'inline-block';
            startButton.textContent = '🎮 开始游戏';
            pauseButton.style.display = 'none';
            difficultySelect.disabled = false;
        } else if (this.isPaused) {
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            pauseButton.textContent = '▶️ 继续';
            difficultySelect.disabled = false;
        } else {
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            pauseButton.textContent = '⏸️ 暂停';
            difficultySelect.disabled = true;
        }
    }

    reset() {
        this.stop();
        this.snake = new Snake();
        this.food = new Food(this.snake.body);
        this.score = 0;

        this.difficulty = this.selectedDifficulty;

        this.currentSpeed = DIFFICULTY_LEVELS[this.difficulty].initialSpeed;
        this.baseSpeed = this.currentSpeed;
        this.keyPressed = false;
        this.boostActive = false;

        this.updateScoreDisplay();
        this.updateDifficultyDisplay();
        this.clearCanvas();
        this.draw();
    }

    update() {
        this.updateSpeed();
        this.snake.move();

        if (this.snake.body[0].x === this.food.position.x && this.snake.body[0].y === this.food.position.y) {
            this.snake.grow();
            this.score += 10;
            this.food = new Food(this.snake.body);
            this.updateScoreDisplay();
        }

        if (this.snake.checkCollision()) {
            this.gameOver();
            return;
        }

        this.draw();
    }

    draw() {
        this.clearCanvas();
        this.drawGrid();
        this.snake.draw(this.ctx);
        this.food.draw(this.ctx);
    }

    clearCanvas() {
        this.backgroundTime += 0.016;
        
        // 背景渐变
        const bgGradient = this.ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        bgGradient.addColorStop(0, '#0a0e27');
        bgGradient.addColorStop(0.5, '#1a1a3e');
        bgGradient.addColorStop(1, '#0d1b2a');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 流动的网格纹理背景
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.03)';
        const offset = (this.backgroundTime * 10) % 20;
        for (let i = 0; i < CANVAS_WIDTH; i += 20) {
            for (let j = 0; j < CANVAS_HEIGHT; j += 20) {
                this.ctx.fillRect(i + offset, j, 10, 10);
            }
        }

        // 添加星空效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = (i * 73 + this.backgroundTime * 5) % CANVAS_WIDTH;
            const y = (i * 37) % CANVAS_HEIGHT;
            const size = Math.sin(this.backgroundTime + i) * 0.5 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    drawGrid() {
        // 主网格线渐变
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            const gradient = this.ctx.createLinearGradient(x, 0, x, CANVAS_HEIGHT);
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
            gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.15)');
            gradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            const gradient = this.ctx.createLinearGradient(0, y, CANVAS_WIDTH, y);
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
            gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.15)');
            gradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }

        // 次级网格线（更浅）
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.04)';
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE / 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE / 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }

        // 边框发光
        const borderGradient = this.ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        borderGradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
        borderGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
        borderGradient.addColorStop(1, 'rgba(100, 200, 255, 0.6)');
        
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    gameOver() {
        this.stop();
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateScoreDisplay();
        }

        const gameStatus = document.getElementById('gameStatus');
        const gameMessage = document.getElementById('gameMessage');
        gameMessage.textContent = `游戏结束！最终分数: ${this.score}`;
        gameStatus.style.display = 'block';
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    updateDifficultyDisplay() {
        const difficultyInfo = DIFFICULTY_LEVELS[this.selectedDifficulty];
        document.getElementById('difficultyDisplay').textContent = difficultyInfo.name;
    }

    updateSpeed() {
        const config = DIFFICULTY_LEVELS[this.difficulty];
        const speedIncrease = Math.floor(this.score / 50) * config.speedIncrement;
        this.baseSpeed = Math.max(config.maxSpeed, config.initialSpeed - speedIncrease);

        if (this.boostActive) {
            this.currentSpeed = Math.floor(this.baseSpeed / 2);
        } else {
            this.currentSpeed = this.baseSpeed;
        }

        if (this.isRunning && this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
        }
    }

    bindEvents() {
        // 键盘事件处理
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();

                this.handleDirectionInput(e.key);

                if (!this.keyPressed) {
                    this.keyPressed = true;
                    setTimeout(() => {
                        if (this.keyPressed) {
                            this.boostActive = true;
                        }
                    }, 200);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.keyPressed = false;
                this.boostActive = false;
            }
        });

        // 触屏事件处理 - 滑动控制
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, false);

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, false);

        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > minSwipeDistance) {
                    this.handleDirectionInput('ArrowRight');
                } else if (deltaX < -minSwipeDistance) {
                    this.handleDirectionInput('ArrowLeft');
                }
            } else {
                // 垂直滑动
                if (deltaY > minSwipeDistance) {
                    this.handleDirectionInput('ArrowDown');
                } else if (deltaY < -minSwipeDistance) {
                    this.handleDirectionInput('ArrowUp');
                }
            }
        }, false);

        // 鼠标在游戏区域控制方向
        let mouseStartX = 0;
        let mouseStartY = 0;
        let isMouseDown = false;

        this.canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
        }, false);

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const deltaX = mouseX - mouseStartX;
            const deltaY = mouseY - mouseStartY;
            const minDragDistance = 20;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平拖动
                if (Math.abs(deltaX) > minDragDistance) {
                    if (deltaX > 0) {
                        this.handleDirectionInput('ArrowRight');
                    } else {
                        this.handleDirectionInput('ArrowLeft');
                    }
                    mouseStartX = mouseX;
                    mouseStartY = mouseY;
                }
            } else {
                // 垂直拖动
                if (Math.abs(deltaY) > minDragDistance) {
                    if (deltaY > 0) {
                        this.handleDirectionInput('ArrowDown');
                    } else {
                        this.handleDirectionInput('ArrowUp');
                    }
                    mouseStartX = mouseX;
                    mouseStartY = mouseY;
                }
            }
        }, false);

        this.canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        }, false);

        this.canvas.addEventListener('mouseleave', () => {
            isMouseDown = false;
        }, false);
    }

    handleDirectionInput(key) {
        let newDirection = { x: 0, y: 0 };
        switch (key) {
            case 'ArrowUp':
                newDirection = { x: 0, y: -GRID_SIZE };
                break;
            case 'ArrowDown':
                newDirection = { x: 0, y: GRID_SIZE };
                break;
            case 'ArrowLeft':
                newDirection = { x: -GRID_SIZE, y: 0 };
                break;
            case 'ArrowRight':
                newDirection = { x: GRID_SIZE, y: 0 };
                break;
        }

        if (newDirection.x !== -this.snake.direction.x || newDirection.y !== -this.snake.direction.y) {
            this.snake.nextDirection = newDirection;
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // 难度选择事件 - 暂停时立即应用新难度
    const difficultySelect = document.getElementById('difficultySelect');
    difficultySelect.addEventListener('change', (e) => {
        game.selectedDifficulty = e.target.value;
        game.updateDifficultyDisplay();
        
        if (game.isPaused) {
            game.difficulty = game.selectedDifficulty;
            game.currentSpeed = DIFFICULTY_LEVELS[game.difficulty].initialSpeed;
            game.baseSpeed = game.currentSpeed;
            console.log('暂停中修改难度为:', game.selectedDifficulty, '新速度:', game.currentSpeed);
        }
    });

    // 开始按钮事件
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', (e) => {
        e.preventDefault();
        game.reset();
        game.start();
    });

    // 重新开始按钮事件
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', (e) => {
            e.preventDefault();
            const gameStatus = document.getElementById('gameStatus');
            gameStatus.style.display = 'none';
            game.reset();
            game.start();
        });
    }

    // 暂停按钮事件
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (game.isPaused) {
                game.resume();
            } else {
                game.pause();
            }
        });
    }

    // 重置按钮事件
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            game.reset();
            game.start();
        });
    }

    // 画布点击 / 触屏 tap 启动或恢复游戏（兼容 PC 和 移动端）
    let touchMoved = false;
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchMoved = false;
        if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        // 如果发生明显位移则认定为移动（控制方向），不是点击
        if (e.touches && e.touches[0]) {
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            if (dx > 8 || dy > 8) {
                touchMoved = true;
            }
        }
    }, false);

    canvas.addEventListener('touchend', (e) => {
        if (!touchMoved) {
            // 触屏 tap 触发：如果未运行则 reset + start；如果暂停则 resume
            if (!game.isRunning) {
                game.reset();
                game.start();
            } else if (game.isPaused) {
                game.resume();
            }
        }
    }, false);

    // 鼠标直接点击画布触发
    canvas.addEventListener('click', () => {
        if (!game.isRunning) {
            game.reset();
            game.start();
        } else if (game.isPaused) {
            game.resume();
        }
    });

    // 方向按钮控制事件（已与 game 实例绑定）
    const directionBtns = document.querySelectorAll('.direction-btn:not(.center)');
    directionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = btn.dataset.direction;
            game.handleDirectionInput(direction);
        });

        // 触屏按钮按下效果
        btn.addEventListener('touchstart', (e) => {
            btn.style.opacity = '0.7';
            // 触屏上支持短按触发方向
            e.preventDefault();
            const direction = btn.dataset.direction;
            if (direction) {
                game.handleDirectionInput(direction);
            }
        }, { passive: false });

        btn.addEventListener('touchend', () => {
            btn.style.opacity = '1';
        });
    });

    // 初始绘制
    game.draw();

    // 点击游戏区域控制蛇方向（基于蛇的位置）
    canvas.addEventListener('click', (e) => {
        // 获取蛇头位置
        const snakeHeadX = game.snake.body[0].x + GRID_SIZE / 2;
        const snakeHeadY = game.snake.body[0].y + GRID_SIZE / 2;
        
        // 获取 canvas 相对于视口的位置
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // 缩放比例（canvas显示大小与实际坐标的比例）
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        
        // 转换点击位置到游戏坐标系
        const gameClickX = clickX * scaleX;
        const gameClickY = clickY * scaleY;
        
        // 计算点击位置相对于蛇头的偏移
        const deltaX = gameClickX - snakeHeadX;
        const deltaY = gameClickY - snakeHeadY;
        
        // 根据偏移判断方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平方向
            if (deltaX > 0) {
                game.handleDirectionInput('ArrowRight');
            } else {
                game.handleDirectionInput('ArrowLeft');
            }
        } else {
            // 垂直方向
            if (deltaY > 0) {
                game.handleDirectionInput('ArrowDown');
            } else {
                game.handleDirectionInput('ArrowUp');
            }
        }
    }, false);

    // 触屏点击区域控制蛇方向（基于蛇的位置）
    let tapStartX = 0;
    let tapStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        tapStartX = e.touches[0].clientX;
        tapStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const movementX = Math.abs(touchEndX - tapStartX);
        const movementY = Math.abs(touchEndY - tapStartY);
        
        // 如果移动距离小于10px，认为是点击
        if (movementX < 10 && movementY < 10) {
            // 获取蛇头位置
            const snakeHeadX = game.snake.body[0].x + GRID_SIZE / 2;
            const snakeHeadY = game.snake.body[0].y + GRID_SIZE / 2;
            
            // 获取 canvas 相对于视口的位置
            const rect = canvas.getBoundingClientRect();
            const tapX = tapStartX - rect.left;
            const tapY = tapStartY - rect.top;
            
            // 缩放比例
            const scaleX = CANVAS_WIDTH / rect.width;
            const scaleY = CANVAS_HEIGHT / rect.height;
            
            // 转换点击位置到游戏坐标系
            const gameClickX = tapX * scaleX;
            const gameClickY = tapY * scaleY;
            
            // 计算点击位置相对于蛇头的偏移
            const deltaX = gameClickX - snakeHeadX;
            const deltaY = gameClickY - snakeHeadY;
            
            // 根据偏移判断方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    game.handleDirectionInput('ArrowRight');
                } else {
                    game.handleDirectionInput('ArrowLeft');
                }
            } else {
                if (deltaY > 0) {
                    game.handleDirectionInput('ArrowDown');
                } else {
                    game.handleDirectionInput('ArrowUp');
                }
            }
        }
    }, false);
});