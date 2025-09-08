const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// GBA Pokémon Emerald color palette
const COLORS = {
    // Grass colors
    GRASS_LIGHT: '#7BC142',
    GRASS_DARK: '#5A9032',
    GRASS_CHECKER: '#6BB03A',
    
    // Dirt path colors
    PATH_LIGHT: '#E6C878',
    PATH_DARK: '#D4B85A',
    PATH_SHADOW: '#C2A648',
    
    // Tree colors
    TREE_TRUNK: '#8B4513',
    TREE_TRUNK_DARK: '#654321',
    TREE_LEAVES: '#228B22',
    TREE_LEAVES_DARK: '#1F5F1F',
    TREE_OUTLINE: '#0F2F0F',
    
    // Character colors
    CHAR_SKIN: '#FFDBAC',
    CHAR_HAIR: '#8B4513',
    CHAR_SHIRT_BLUE: '#4169E1',
    CHAR_SHIRT_RED: '#DC143C',
    CHAR_PANTS: '#2F4F4F',
    CHAR_HAT: '#DC143C',
    CHAR_GLASSES: '#000000',
    CHAR_OUTLINE: '#000000',
    
    // Flower colors
    FLOWER_RED: '#FF4444',
    FLOWER_CENTER: '#FFFF44',
    
    // Dialogue box colors
    DIALOG_BG: '#FFFFFF',
    DIALOG_BORDER: '#4169E1',
    DIALOG_SHADOW: '#000000',
    DIALOG_TEXT: '#000000',
    
    // Shadow color
    SHADOW: 'rgba(0, 0, 0, 0.3)'
};

// Clear canvas (we'll fully paint grass)
ctx.fillStyle = '#6BB03A';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw grass tiles with checker pattern
function drawGrassTile(x, y) {
    // Base grass
    ctx.fillStyle = COLORS.GRASS_LIGHT;
    ctx.fillRect(x, y, 16, 16);
    // Checker pattern blocks
    ctx.fillStyle = COLORS.GRASS_CHECKER;
    for (let ty = 0; ty < 16; ty += 8) {
        for (let tx = 0; tx < 16; tx += 8) {
            if (((x + tx) / 8 + (y + ty) / 8) % 2 === 1) {
                ctx.fillRect(x + tx, y + ty, 8, 8);
            }
        }
    }
    // Tiny accents
    ctx.fillStyle = COLORS.GRASS_DARK;
    ctx.fillRect(x + 3, y + 2, 1, 1);
    ctx.fillRect(x + 6, y + 5, 1, 1);
}

// Draw dirt path tile
function drawPathTile(x, y) {
    // Base path
    ctx.fillStyle = COLORS.PATH_LIGHT;
    ctx.fillRect(x, y, 16, 16);
    // Edge accents top/bottom
    ctx.fillStyle = COLORS.PATH_DARK;
    ctx.fillRect(x, y, 16, 1);
    ctx.fillRect(x, y + 1, 16, 1);
    ctx.fillRect(x, y + 15, 16, 1);
    ctx.fillRect(x, y + 14, 16, 1);
    // Speckles
    ctx.fillRect(x + 2, y + 6, 1, 1);
    ctx.fillRect(x + 6, y + 8, 1, 1);
    ctx.fillRect(x + 10, y + 10, 1, 1);
}

// Draw evergreen tree
function drawTree(x, y) {
    // Layered canopy blocks with outline feel
    // Bottom layer (dark)
    ctx.fillStyle = COLORS.TREE_OUTLINE;
    ctx.fillRect(x + 1, y + 20, 16, 8);
    ctx.fillRect(x + 3, y + 14, 12, 6);
    ctx.fillRect(x + 5, y + 9, 8, 5);
    ctx.fillRect(x + 7, y + 5, 6, 4);
    // Foliage
    ctx.fillStyle = COLORS.TREE_LEAVES_DARK;
    ctx.fillRect(x + 2, y + 20, 14, 7);
    ctx.fillRect(x + 4, y + 14, 10, 5);
    ctx.fillRect(x + 6, y + 9, 8, 4);
    ctx.fillStyle = COLORS.TREE_LEAVES;
    ctx.fillRect(x + 6, y + 5, 6, 3);
    // Trunk
    ctx.fillStyle = COLORS.TREE_TRUNK;
    ctx.fillRect(x + 7, y + 26, 4, 2);
}

// Draw small red flower
function drawFlower(x, y) {
    // Flower petals
    ctx.fillStyle = COLORS.FLOWER_RED;
    ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillRect(x + 2, y + 1, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x + 1, y + 2, 1, 1);
    
    // Flower center
    ctx.fillStyle = COLORS.FLOWER_CENTER;
    ctx.fillRect(x + 1, y + 1, 1, 1);
}

// Draw character shadow
function drawShadow(x, y, width, height) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x, y, width, height);
}

// Draw player character (back view)
function drawPlayer(x, y) {
    // Shadow
    drawShadow(x + 2, y + 14, 12, 2);
    
    // Character outline
    ctx.fillStyle = COLORS.CHAR_OUTLINE;
    ctx.fillRect(x + 4, y, 8, 16);
    
    // Hair
    ctx.fillStyle = COLORS.CHAR_HAIR;
    ctx.fillRect(x + 5, y + 1, 6, 4);
    
    // Skin (neck)
    ctx.fillStyle = COLORS.CHAR_SKIN;
    ctx.fillRect(x + 6, y + 4, 4, 2);
    
    // Shirt
    ctx.fillStyle = COLORS.CHAR_SHIRT_BLUE;
    ctx.fillRect(x + 5, y + 6, 6, 6);
    
    // Arms
    ctx.fillStyle = COLORS.CHAR_SKIN;
    ctx.fillRect(x + 4, y + 7, 2, 3);
    ctx.fillRect(x + 10, y + 7, 2, 3);
    
    // Pants
    ctx.fillStyle = COLORS.CHAR_PANTS;
    ctx.fillRect(x + 5, y + 12, 6, 4);
    
    // Shoes
    ctx.fillStyle = COLORS.CHAR_OUTLINE;
    ctx.fillRect(x + 5, y + 15, 2, 1);
    ctx.fillRect(x + 9, y + 15, 2, 1);
}

// Draw NPC with red hat and glasses (front view)
function drawNPC(x, y) {
    // Shadow
    drawShadow(x + 2, y + 14, 12, 2);
    
    // Character outline
    ctx.fillStyle = COLORS.CHAR_OUTLINE;
    ctx.fillRect(x + 4, y, 8, 16);
    
    // Hat
    ctx.fillStyle = COLORS.CHAR_HAT;
    ctx.fillRect(x + 4, y + 1, 8, 4);
    ctx.fillRect(x + 3, y + 2, 10, 2); // Hat brim
    
    // Face
    ctx.fillStyle = COLORS.CHAR_SKIN;
    ctx.fillRect(x + 5, y + 4, 6, 4);
    
    // Glasses
    ctx.fillStyle = COLORS.CHAR_GLASSES;
    ctx.fillRect(x + 5, y + 5, 2, 2);
    ctx.fillRect(x + 9, y + 5, 2, 2);
    ctx.fillRect(x + 7, y + 6, 1, 1); // Bridge
    
    // Glasses lenses (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, y + 6, 1, 1);
    ctx.fillRect(x + 10, y + 6, 1, 1);
    
    // Shirt
    ctx.fillStyle = COLORS.CHAR_SHIRT_RED;
    ctx.fillRect(x + 5, y + 8, 6, 4);
    
    // Arms
    ctx.fillStyle = COLORS.CHAR_SKIN;
    ctx.fillRect(x + 4, y + 9, 2, 3);
    ctx.fillRect(x + 10, y + 9, 2, 3);
    
    // Pants
    ctx.fillStyle = COLORS.CHAR_PANTS;
    ctx.fillRect(x + 5, y + 12, 6, 4);
    
    // Shoes
    ctx.fillStyle = COLORS.CHAR_OUTLINE;
    ctx.fillRect(x + 5, y + 15, 2, 1);
    ctx.fillRect(x + 9, y + 15, 2, 1);
}

// Draw dialogue box
function drawDialogueBox() {
    const boxX = 8;
    const boxY = 120;
    const boxWidth = 224;
    const boxHeight = 32;
    
    // Drop shadow
    ctx.fillStyle = COLORS.DIALOG_SHADOW;
    ctx.fillRect(boxX + 2, boxY + 2, boxWidth, boxHeight);
    
    // Border
    ctx.fillStyle = COLORS.DIALOG_BORDER;
    ctx.fillRect(boxX - 2, boxY - 2, boxWidth + 4, boxHeight + 4);
    
    // Background
    ctx.fillStyle = COLORS.DIALOG_BG;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Text
    ctx.fillStyle = COLORS.DIALOG_TEXT;
    ctx.font = '8px monospace';
    
    // Draw text with proper spacing and bold words
    const text1 = "MAGE put the ";
    const boldText1 = "POTION";
    const text2 = " away in the ";
    const boldText2 = "BAG";
    const text3 = "'s";
    const text4 = "ITEMS POCKET.";
    
    let textX = boxX + 8;
    const textY = boxY + 12;
    const textY2 = boxY + 22;
    
    // First line
    ctx.font = '8px monospace';
    ctx.fillText(text1, textX, textY);
    textX += ctx.measureText(text1).width;
    
    // Bold POTION
    ctx.font = 'bold 8px monospace';
    ctx.fillText(boldText1, textX, textY);
    textX += ctx.measureText(boldText1).width + 2;
    
    ctx.font = '8px monospace';
    ctx.fillText(text2, textX, textY);
    textX += ctx.measureText(text2).width;
    
    // Bold BAG
    ctx.font = 'bold 8px monospace';
    ctx.fillText(boldText2, textX, textY);
    textX += ctx.measureText(boldText2).width;
    
    ctx.font = '8px monospace';
    ctx.fillText(text3, textX, textY);
    
    // Second line
    ctx.fillText(text4, boxX + 8, textY2);
}

// Main drawing function
function drawScene() {
    console.log('Drawing Pokémon Emerald scene...');
    
    // Fill background with grass tiles
    for (let y = 0; y < 160; y += 16) {
        for (let x = 0; x < 240; x += 16) {
            drawGrassTile(x, y);
        }
    }
    
    // Draw horizontal dirt path
    for (let x = 0; x < 240; x += 16) {
        drawPathTile(x, 64); // Middle horizontal path
        drawPathTile(x, 80);
    }
    
    // Draw dense forest of evergreen trees
    // Top row of trees
    drawTree(16, 0);
    drawTree(48, 0);
    drawTree(80, 0);
    drawTree(112, 0);
    drawTree(144, 0);
    drawTree(176, 0);
    drawTree(208, 0);
    
    // Second row (offset)
    drawTree(0, 16);
    drawTree(32, 16);
    drawTree(64, 16);
    drawTree(96, 16);
    drawTree(128, 16);
    drawTree(160, 16);
    drawTree(192, 16);
    drawTree(224, 16);
    
    // Bottom rows of trees
    drawTree(16, 96);
    drawTree(48, 96);
    drawTree(80, 96);
    drawTree(112, 96);
    drawTree(144, 96);
    drawTree(176, 96);
    drawTree(208, 96);
    
    drawTree(0, 112);
    drawTree(32, 112);
    drawTree(64, 112);
    drawTree(96, 112);
    drawTree(128, 112);
    drawTree(160, 112);
    drawTree(192, 112);
    drawTree(224, 112);
    
    // Scatter red flowers beside trees
    drawFlower(24, 40);
    drawFlower(56, 36);
    drawFlower(88, 42);
    drawFlower(120, 38);
    drawFlower(152, 44);
    drawFlower(184, 40);
    drawFlower(216, 36);
    
    drawFlower(8, 104);
    drawFlower(40, 108);
    drawFlower(72, 102);
    drawFlower(104, 106);
    drawFlower(136, 104);
    drawFlower(168, 108);
    drawFlower(200, 102);
    drawFlower(232, 106);
    
    // Draw characters in the center facing each other
    drawPlayer(96, 56); // Player (back view)
    drawNPC(128, 56);   // NPC with hat and glasses (front view)
    
    // Draw dialogue box
    drawDialogueBox();
    
    console.log('Scene complete!');
}

// Initialize the scene
drawScene();